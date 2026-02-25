-- CreateTable
CREATE TABLE "patient_stage_notifications" (
    "id" TEXT NOT NULL,
    "queue_id" INTEGER NOT NULL,
    "patient_id" INTEGER,
    "stage" "QueueStatus" NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_stage_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_audit_logs" (
    "id" TEXT NOT NULL,
    "queue_id" INTEGER NOT NULL,
    "staff_id" INTEGER,
    "action" TEXT NOT NULL,
    "from_stage" "QueueStatus",
    "to_stage" "QueueStatus",
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queue_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_stage_notifications_queue_id_idx" ON "patient_stage_notifications"("queue_id");

-- CreateIndex
CREATE INDEX "patient_stage_notifications_patient_id_idx" ON "patient_stage_notifications"("patient_id");

-- CreateIndex
CREATE INDEX "queue_audit_logs_queue_id_idx" ON "queue_audit_logs"("queue_id");

-- CreateIndex
CREATE INDEX "queue_audit_logs_staff_id_idx" ON "queue_audit_logs"("staff_id");

-- AddForeignKey
ALTER TABLE "patient_stage_notifications" ADD CONSTRAINT "patient_stage_notifications_queue_id_fkey"
FOREIGN KEY ("queue_id") REFERENCES "Queue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_stage_notifications" ADD CONSTRAINT "patient_stage_notifications_patient_id_fkey"
FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_audit_logs" ADD CONSTRAINT "queue_audit_logs_queue_id_fkey"
FOREIGN KEY ("queue_id") REFERENCES "Queue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_audit_logs" ADD CONSTRAINT "queue_audit_logs_staff_id_fkey"
FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

