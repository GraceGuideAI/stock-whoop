import whoopData from "@/data/whoop.json";

export type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y" | "All";

export type DailyHealthRecord = {
  date: string;
  recovery?: number;
  sleepPerformance?: number;
  sleepHours?: number;
  sleepDebtHours?: number;
  strain?: number;
  hrvRmssd?: number;
  rhr?: number;
  respiratoryRate?: number;
  skinTempC?: number;
  caloriesKcal?: number;
  steps?: number;
};

type WhoopPayload = {
  sleep_collection?: { records?: any[] };
  recovery_collection?: { records?: any[] };
  cycle_collection?: { records?: any[] };
};

type DayMetric = {
  date: Date;
  recovery?: number;
  sleepPerformance?: number;
  sleepHours?: number;
  sleepDebtHours?: number;
  strain?: number;
  hrvRmssd?: number;
  rhr?: number;
  respiratoryRate?: number;
  skinTempC?: number;
  caloriesKcal?: number;
  steps?: number;
};

export const timeframeDays: Record<Timeframe, number | null> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "1Y": 365,
  All: null
};

function parseOffsetMinutes(offset?: string) {
  if (!offset) return 0;
  const match = offset.match(/([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

function dayKeyFrom(dateString?: string, offset?: string) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  const localDate = new Date(date.getTime() + parseOffsetMinutes(offset) * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function mergeMetric(map: Map<string, DayMetric>, key: string, data: Partial<DayMetric>) {
  const date = new Date(`${key}T00:00:00.000Z`);
  const existing = map.get(key) ?? { date };
  map.set(key, { ...existing, ...data, date });
}

export function parseWhoop(payload: WhoopPayload = whoopData as WhoopPayload) {
  const dayMap = new Map<string, DayMetric>();

  for (const record of payload.sleep_collection?.records ?? []) {
    const key = dayKeyFrom(record.start, record.timezone_offset);
    if (!key || !record.score) continue;
    const stage = record.score.stage_summary ?? {};
    const totalSleepMs =
      (stage.total_light_sleep_time_milli ?? 0) +
      (stage.total_slow_wave_sleep_time_milli ?? 0) +
      (stage.total_rem_sleep_time_milli ?? 0);
    const sleepHours = totalSleepMs ? totalSleepMs / 3_600_000 : undefined;
    const sleepDebtHours = record.score.sleep_needed?.need_from_sleep_debt_milli
      ? Math.max(0, record.score.sleep_needed.need_from_sleep_debt_milli / 3_600_000)
      : undefined;

    mergeMetric(dayMap, key, {
      sleepPerformance: record.score.sleep_performance_percentage,
      sleepHours,
      sleepDebtHours,
      respiratoryRate: record.score.respiratory_rate
    });
  }

  for (const record of payload.recovery_collection?.records ?? []) {
    const key = dayKeyFrom(record.created_at, record.timezone_offset);
    if (!key || !record.score) continue;
    mergeMetric(dayMap, key, {
      recovery: record.score.recovery_score,
      rhr: record.score.resting_heart_rate,
      hrvRmssd: record.score.hrv_rmssd_milli,
      skinTempC: record.score.skin_temp_celsius
    });
  }

  for (const record of payload.cycle_collection?.records ?? []) {
    const key = dayKeyFrom(record.start, record.timezone_offset);
    if (!key || !record.score) continue;
    const caloriesKcal = record.score.kilojoule ? record.score.kilojoule * 0.239006 : undefined;
    mergeMetric(dayMap, key, {
      strain: record.score.strain,
      caloriesKcal,
      steps: record.score.steps
    });
  }

  return Array.from(dayMap.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((entry) => ({
      date: entry.date.toISOString().slice(0, 10),
      recovery: entry.recovery ?? undefined,
      sleepPerformance: entry.sleepPerformance ?? undefined,
      sleepHours: entry.sleepHours ?? undefined,
      sleepDebtHours: entry.sleepDebtHours ?? undefined,
      strain: entry.strain ?? undefined,
      hrvRmssd: entry.hrvRmssd ?? undefined,
      rhr: entry.rhr ?? undefined,
      respiratoryRate: entry.respiratoryRate ?? undefined,
      skinTempC: entry.skinTempC ?? undefined,
      caloriesKcal: entry.caloriesKcal ?? undefined,
      steps: entry.steps ?? undefined
    }));
}

export function getMetricsByTimeframe(timeframe: Timeframe = "1M", data = parseWhoop()) {
  const days = timeframeDays[timeframe] ?? 30;
  if (days === null) return data;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return data.filter((d) => new Date(`${d.date}T00:00:00.000Z`) >= cutoff);
}
