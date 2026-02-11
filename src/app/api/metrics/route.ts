import { NextResponse } from "next/server";
import { getMetricsByTimeframe, type Timeframe } from "@/lib/whoop";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeframe = (searchParams.get("timeframe") ?? "1M") as Timeframe;

  return NextResponse.json({
    timeframe,
    data: getMetricsByTimeframe(timeframe)
  });
}
