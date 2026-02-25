-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "durationEntry" INTEGER,
ADD COLUMN     "durationPackaging" INTEGER,
ADD COLUMN     "durationPenyerahan" INTEGER,
ADD COLUMN     "durationTotal" INTEGER,
ADD COLUMN     "durationTransport" INTEGER,
ADD COLUMN     "entryEndAt" TIMESTAMP(3),
ADD COLUMN     "entryStartAt" TIMESTAMP(3),
ADD COLUMN     "packagingEndAt" TIMESTAMP(3),
ADD COLUMN     "packagingStartAt" TIMESTAMP(3),
ADD COLUMN     "penyerahanEndAt" TIMESTAMP(3),
ADD COLUMN     "penyerahanStartAt" TIMESTAMP(3),
ADD COLUMN     "transportEndAt" TIMESTAMP(3),
ADD COLUMN     "transportStartAt" TIMESTAMP(3);
