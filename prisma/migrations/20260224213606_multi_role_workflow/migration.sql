-- CreateEnum
CREATE TYPE "QueueLogStatus" AS ENUM ('WAITING', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('MENUNGGU', 'ENTRY', 'TRANSPORT', 'PACKAGING', 'PENYERAHAN', 'SELESAI', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('UTAMA', 'ENTRY', 'TRANSPORT', 'PACKAGING', 'PENYERAHAN');

-- CreateTable
CREATE TABLE "Queue" (
    "id" SERIAL NOT NULL,
    "queue" TEXT NOT NULL,
    "mrn" TEXT NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'MENUNGGU',
    "entryAt" TIMESTAMP(3),
    "transportAt" TIMESTAMP(3),
    "packagingAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "queue" TEXT NOT NULL,
    "mrn" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientLogin" (
    "id" SERIAL NOT NULL,
    "queue" TEXT NOT NULL,
    "mrn" TEXT NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',

    CONSTRAINT "PatientLogin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_logs" (
    "id" SERIAL NOT NULL,
    "queue_number" TEXT NOT NULL,
    "patient_name" TEXT,
    "medical_record_number" TEXT NOT NULL,
    "service_type" TEXT,
    "status" "QueueLogStatus" NOT NULL DEFAULT 'WAITING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "called_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "admin_id" INTEGER,
    "queue_id" INTEGER,

    CONSTRAINT "queue_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_stage_logs" (
    "id" SERIAL NOT NULL,
    "queueId" INTEGER NOT NULL,
    "stage" "QueueStatus" NOT NULL,
    "staff_id" INTEGER,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queue_stage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "mrn" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "clinic_origin" TEXT,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "roles" "AdminRole"[],
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" SERIAL NOT NULL,
    "queue_id" INTEGER,
    "drug_list" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "queue_id" INTEGER,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Queue_queue_key" ON "Queue"("queue");

-- CreateIndex
CREATE UNIQUE INDEX "queue_logs_queue_number_key" ON "queue_logs"("queue_number");

-- CreateIndex
CREATE UNIQUE INDEX "patients_mrn_key" ON "patients"("mrn");

-- CreateIndex
CREATE UNIQUE INDEX "staff_username_key" ON "staff"("username");
