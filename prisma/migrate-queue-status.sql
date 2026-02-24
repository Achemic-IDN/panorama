-- Migrasi status antrean lama ke enum PANORAMA
-- Jalankan di database PostgreSQL SEBELUM mengubah tipe kolom status menjadi QueueStatus
-- Mapping:
--  Menunggu -> WAITING
--  Waiting  -> WAITING
--  Dipanggil -> ENTRY
--  Selesai -> COMPLETED

UPDATE "Queue"
SET status = 'WAITING'
WHERE status IN ('Menunggu', 'Waiting');

UPDATE "Queue"
SET status = 'ENTRY'
WHERE status = 'Dipanggil';

UPDATE "Queue"
SET status = 'COMPLETED'
WHERE status = 'Selesai';

