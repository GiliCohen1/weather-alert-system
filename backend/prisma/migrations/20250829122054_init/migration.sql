-- CreateTable
CREATE TABLE "public"."Alert" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "locationType" TEXT NOT NULL,
    "city" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "parameter" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AlertEvaluation" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "evaluatedAt" TIMESTAMP(3) NOT NULL,
    "observedValue" DOUBLE PRECISION NOT NULL,
    "triggered" BOOLEAN NOT NULL,

    CONSTRAINT "AlertEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_locationType_idx" ON "public"."Alert"("locationType");

-- CreateIndex
CREATE INDEX "AlertEvaluation_alertId_evaluatedAt_idx" ON "public"."AlertEvaluation"("alertId", "evaluatedAt");

-- AddForeignKey
ALTER TABLE "public"."AlertEvaluation" ADD CONSTRAINT "AlertEvaluation_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "public"."Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
