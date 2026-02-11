import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const timeframeDays: Record<string, number | null> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "1Y": 365,
  All: null
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe") ?? "1M";
  const days = timeframeDays[timeframe] ?? 30;

  const where =
    days === null
      ? undefined
      : {
          date: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        };

  const data = await prisma.dailyMetric.findMany({
    where,
    orderBy: { date: "asc" }
  });

  return NextResponse.json({
    timeframe,
    data: data.map((entry) => ({
      date: entry.date.toISOString().slice(0, 10),
      recovery: entry.recovery ?? undefined,
      sleepPerformance: entry.sleepPerformance ?? undefined,
      sleepHours: entry.sleepHours ?? undefined,
      strain: entry.strain ?? undefined,
      hrvRmssd: entry.hrvRmssd ?? undefined,
      rhr: entry.rhr ?? undefined,
      respiratoryRate: entry.respiratoryRate ?? undefined,
      skinTempC: entry.skinTempC ?? undefined,
      caloriesKcal: entry.caloriesKcal ?? undefined,
      steps: entry.steps ?? undefined
    }))
  });
}
