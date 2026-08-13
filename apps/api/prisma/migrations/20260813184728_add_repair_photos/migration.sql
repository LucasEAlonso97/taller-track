-- CreateTable
CREATE TABLE "RepairPhoto" (
    "id" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "repairOrderId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RepairPhoto_storageKey_key" ON "RepairPhoto"("storageKey");

-- CreateIndex
CREATE INDEX "RepairPhoto_repairOrderId_idx" ON "RepairPhoto"("repairOrderId");

-- CreateIndex
CREATE INDEX "RepairPhoto_createdAt_idx" ON "RepairPhoto"("createdAt");

-- AddForeignKey
ALTER TABLE "RepairPhoto" ADD CONSTRAINT "RepairPhoto_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "RepairOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
