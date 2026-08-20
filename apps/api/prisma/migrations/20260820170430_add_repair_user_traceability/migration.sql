-- AlterTable
ALTER TABLE "RepairInternalNote" ADD COLUMN     "createdById" UUID;

-- AlterTable
ALTER TABLE "RepairOrder" ADD COLUMN     "diagnosisUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "diagnosisUpdatedById" UUID;

-- AlterTable
ALTER TABLE "RepairQuote" ADD COLUMN     "respondedById" UUID,
ADD COLUMN     "updatedById" UUID;

-- AlterTable
ALTER TABLE "RepairStatusHistory" ADD COLUMN     "changedById" UUID;

-- CreateIndex
CREATE INDEX "RepairInternalNote_createdById_idx" ON "RepairInternalNote"("createdById");

-- CreateIndex
CREATE INDEX "RepairOrder_diagnosisUpdatedById_idx" ON "RepairOrder"("diagnosisUpdatedById");

-- CreateIndex
CREATE INDEX "RepairQuote_updatedById_idx" ON "RepairQuote"("updatedById");

-- CreateIndex
CREATE INDEX "RepairQuote_respondedById_idx" ON "RepairQuote"("respondedById");

-- CreateIndex
CREATE INDEX "RepairStatusHistory_changedById_idx" ON "RepairStatusHistory"("changedById");

-- AddForeignKey
ALTER TABLE "RepairOrder" ADD CONSTRAINT "RepairOrder_diagnosisUpdatedById_fkey" FOREIGN KEY ("diagnosisUpdatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairStatusHistory" ADD CONSTRAINT "RepairStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairQuote" ADD CONSTRAINT "RepairQuote_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairQuote" ADD CONSTRAINT "RepairQuote_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairInternalNote" ADD CONSTRAINT "RepairInternalNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
