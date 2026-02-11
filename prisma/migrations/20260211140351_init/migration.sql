-- CreateTable
CREATE TABLE "DailyMetric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "recovery" INTEGER,
    "sleepPerformance" INTEGER,
    "sleepHours" REAL,
    "strain" REAL,
    "hrvRmssd" REAL,
    "rhr" INTEGER,
    "respiratoryRate" REAL,
    "skinTempC" REAL,
    "caloriesKcal" REAL,
    "steps" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MetricSeries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "metric" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "value" REAL NOT NULL,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyMetric_date_key" ON "DailyMetric"("date");

-- CreateIndex
CREATE INDEX "MetricSeries_metric_date_idx" ON "MetricSeries"("metric", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MetricSeries_metric_date_key" ON "MetricSeries"("metric", "date");
