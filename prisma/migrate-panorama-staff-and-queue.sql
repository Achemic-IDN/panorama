-- Safe migration helper for PANORAMA (PostgreSQL)
-- Tujuan:
-- 1) Staff: enum role + created_at column
-- 2) Queue: enum QueueStatus untuk status (tanpa drop & recreate)
-- 3) Queue: optional timestamp kolom stage
-- 4) Buat tabel queue_stage_logs untuk audit stage
--
-- Jalankan script ini di DB PostgreSQL Anda (mis. Neon) sebelum `prisma db push`.

-- 1) Buat enum types jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QueueStatus') THEN
    CREATE TYPE "QueueStatus" AS ENUM (
      'WAITING',
      'ENTRY',
      'TRANSPORT',
      'PACKAGING',
      'READY',
      'COMPLETED',
      'CANCELLED'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StaffRole') THEN
    CREATE TYPE "StaffRole" AS ENUM (
      'ENTRY',
      'TRANSPORT',
      'PACKAGING',
      'PICKUP',
      'ADMIN'
    );
  END IF;
END $$;

-- 2) Staff schema updates
ALTER TABLE IF EXISTS staff
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Normalize staff.role to UPPER before casting
UPDATE staff
SET role = UPPER(role)
WHERE role IS NOT NULL;

DO $$
DECLARE
  v_data_type text;
  v_udt_name text;
BEGIN
  SELECT data_type, udt_name
  INTO v_data_type, v_udt_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'staff'
    AND column_name = 'role';

  -- Cast only if still text-like
  IF v_data_type IS NOT NULL AND v_data_type <> 'USER-DEFINED' THEN
    ALTER TABLE staff
      ALTER COLUMN role TYPE "StaffRole"
      USING role::"StaffRole";
  END IF;
END $$;

-- 3) Queue schema updates (Queue table uses quoted identifier from Prisma)
-- Tambahkan kolom timestamps (opsional)
ALTER TABLE IF EXISTS "Queue" ADD COLUMN IF NOT EXISTS "entryAt" TIMESTAMP(3);
ALTER TABLE IF EXISTS "Queue" ADD COLUMN IF NOT EXISTS "transportAt" TIMESTAMP(3);
ALTER TABLE IF EXISTS "Queue" ADD COLUMN IF NOT EXISTS "packagingAt" TIMESTAMP(3);
ALTER TABLE IF EXISTS "Queue" ADD COLUMN IF NOT EXISTS "readyAt" TIMESTAMP(3);
ALTER TABLE IF EXISTS "Queue" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- Jika status masih TEXT, map data lama lalu cast ke enum
DO $$
DECLARE
  v_data_type text;
  v_udt_name text;
BEGIN
  SELECT data_type, udt_name
  INTO v_data_type, v_udt_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'Queue'
    AND column_name = 'status';

  IF v_data_type IS NOT NULL AND v_data_type <> 'USER-DEFINED' THEN
    -- Map legacy statuses
    UPDATE "Queue"
    SET status = 'WAITING'
    WHERE status IN ('Menunggu', 'Waiting');

    UPDATE "Queue"
    SET status = 'ENTRY'
    WHERE status = 'Dipanggil';

    UPDATE "Queue"
    SET status = 'COMPLETED'
    WHERE status = 'Selesai';

    -- Convert to enum
    ALTER TABLE "Queue"
      ALTER COLUMN status TYPE "QueueStatus"
      USING status::"QueueStatus";
  END IF;
END $$;

-- 4) Queue stage logs table (audit trail)
CREATE TABLE IF NOT EXISTS queue_stage_logs (
  id SERIAL PRIMARY KEY,
  queue_id INT NOT NULL,
  stage "QueueStatus" NOT NULL,
  staff_id INT NULL,
  notes TEXT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

