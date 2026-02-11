import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type WhoopPayload = {
  sleep_collection?: { records?: unknown[] };
  recovery_collection?: { records?: unknown[] };
  workout_collection?: { records?: unknown[] };
  cycle_collection?: { records?: unknown[] };
};

type DayMetric = {
  date: Date;
  recovery?: number;
  sleepPerformance?: number;
  sleepHours?: number;
  strain?: number;
  hrvRmssd?: number;
  rhr?: number;
  respiratoryRate?: number;
  skinTempC?: number;
  caloriesKcal?: number;
  steps?: number;
};

const METRIC_KEYS: (keyof Omit<DayMetric, "date">)[] = [
  "recovery",
  "sleepPerformance",
  "sleepHours",
  "strain",
  "hrvRmssd",
  "rhr",
  "respiratoryRate",
  "skinTempC",
  "caloriesKcal",
  "steps"
];

function parseOffsetMinutes(offset?: string) {
  if (!offset) return 0;
  const match = offset.match(/([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  return sign * (hours * 60 + minutes);
}

function dayKeyFrom(dateString?: string, offset?: string) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  const offsetMinutes = parseOffsetMinutes(offset);
  const localDate = new Date(date.getTime() + offsetMinutes * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function mergeMetric(map: Map<string, DayMetric>, key: string, data: Partial<DayMetric>) {
  const date = new Date(`${key}T00:00:00.000Z`);
  const existing = map.get(key) ?? { date };
  map.set(key, { ...existing, ...data, date });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as WhoopPayload;
  const dayMap = new Map<string, DayMetric>();

  const sleepRecords = payload.sleep_collection?.records ?? [];
  for (const record of sleepRecords as any[]) {
    const key = dayKeyFrom(record.start, record.timezone_offset);
    if (!key || !record.score) continue;
    const stage = record.score.stage_summary ?? {};
    const totalSleepMs =
      (stage.total_light_sleep_time_milli ?? 0) +
      (stage.total_slow_wave_sleep_time_milli ?? 0) +
      (stage.total_rem_sleep_time_milli ?? 0);
    const sleepHours = totalSleepMs ? totalSleepMs / 3_600_000 : undefined;
    mergeMetric(dayMap, key, {
      sleepPerformance: record.score.sleep_performance_percentage,
      sleepHours,
      respiratoryRate: record.score.respiratory_rate
    });
  }

  const recoveryRecords = payload.recovery_collection?.records ?? [];
  for (const record of recoveryRecords as any[]) {
    const key = dayKeyFrom(record.created_at, record.timezone_offset);
    if (!key || !record.score) continue;
    mergeMetric(dayMap, key, {
      recovery: record.score.recovery_score,
      rhr: record.score.resting_heart_rate,
      hrvRmssd: record.score.hrv_rmssd_milli,
      skinTempC: record.score.skin_temp_celsius
    });
  }

  const cycleRecords = payload.cycle_collection?.records ?? [];
  for (const record of cycleRecords as any[]) {
    const key = dayKeyFrom(record.start, record.timezone_offset);
    if (!key || !record.score) continue;
    const caloriesKcal = record.score.kilojoule
      ? record.score.kilojoule * 0.239006
      : undefined;
    mergeMetric(dayMap, key, {
      strain: record.score.strain,
      caloriesKcal
    });
  }

  let upserted = 0;
  for (const [key, metrics] of dayMap.entries()) {
    await prisma.dailyMetric.upsert({
      where: { date: metrics.date },
      create: metrics,
      update: metrics
    });

    for (const metricKey of METRIC_KEYS) {
      const value = metrics[metricKey];
      if (typeof value !== "number" || Number.isNaN(value)) continue;
      await prisma.metricSeries.upsert({
        where: {
          metric_date: { metric: metricKey, date: metrics.date }
        },
        create: {
          metric: metricKey,
          date: metrics.date,
          value
        },
        update: { value }
      });
    }
    upserted += 1;
  }

  return NextResponse.json({ days: upserted, dates: Array.from(dayMap.keys()) });
}
