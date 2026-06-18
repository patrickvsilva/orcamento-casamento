-- AlterTable
ALTER TABLE "vendors" ADD COLUMN "next_due_date" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "vendors_next_due_date_idx" ON "vendors"("next_due_date");
