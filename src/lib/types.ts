import type { MetricKey } from "@/lib/metrics";

export type DailyMetricRecord = {
  date: string;
  sleepDebtHours?: number;
} & Partial<Record<MetricKey, number>>;

export type MetricsResponse = {
  timeframe: string;
  data: DailyMetricRecord[];
};
