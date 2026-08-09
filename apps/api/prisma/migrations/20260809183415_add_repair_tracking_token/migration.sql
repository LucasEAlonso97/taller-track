/*
  Warnings:

  - A unique constraint covering the columns `[trackingToken]` on the table `RepairOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RepairOrder" ADD COLUMN     "trackingToken" UUID NOT NULL DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "RepairOrder_trackingToken_key" ON "RepairOrder"("trackingToken");
