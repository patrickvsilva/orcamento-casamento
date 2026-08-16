-- CreateTable
CREATE TABLE "cash_settings" (
    "id" TEXT NOT NULL,
    "starting_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "expected_date" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incomes_expected_date_idx" ON "incomes"("expected_date");

-- CreateIndex
CREATE INDEX "incomes_received_at_idx" ON "incomes"("received_at");

-- Enable RLS on public tables exposed to PostgREST
ALTER TABLE public.cash_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

-- Singleton row for starting balance
INSERT INTO "cash_settings" ("id", "starting_balance", "updated_at")
VALUES ('default', 0, CURRENT_TIMESTAMP);
