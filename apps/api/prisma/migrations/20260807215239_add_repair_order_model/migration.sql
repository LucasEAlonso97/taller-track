-- CreateEnum
CREATE TYPE "RepairStatus" AS ENUM ('RECEIVED', 'IN_DIAGNOSIS', 'WAITING_APPROVAL', 'IN_REPAIR', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED', 'UNREPAIRED');

-- CreateTable
CREATE TABLE "RepairOrder" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "reportedIssue" TEXT NOT NULL,
    "diagnosis" TEXT,
    "status" "RepairStatus" NOT NULL DEFAULT 'RECEIVED',
    "estimatedCompletionDate" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "deviceId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RepairOrder_code_key" ON "RepairOrder"("code");

-- CreateIndex
CREATE INDEX "RepairOrder_deviceId_idx" ON "RepairOrder"("deviceId");

-- CreateIndex
CREATE INDEX "RepairOrder_status_idx" ON "RepairOrder"("status");

-- AddForeignKey
ALTER TABLE "RepairOrder" ADD CONSTRAINT "RepairOrder_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
