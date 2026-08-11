-- CreateTable
CREATE TABLE "RepairInternalNote" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "repairOrderId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairInternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepairInternalNote_repairOrderId_idx" ON "RepairInternalNote"("repairOrderId");

-- CreateIndex
CREATE INDEX "RepairInternalNote_createdAt_idx" ON "RepairInternalNote"("createdAt");

-- AddForeignKey
ALTER TABLE "RepairInternalNote" ADD CONSTRAINT "RepairInternalNote_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "RepairOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
