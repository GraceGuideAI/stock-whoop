"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyMetricRecord } from "@/lib/types";

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

type Props = { data: DailyMetricRecord[] };

export default function TrendCharts({ data }: Props) {
  const isMobile = useIsMobile();

  const readinessTrend = React.useMemo(
    () =>
      data.map((row) => ({
        date: row.date,
        recovery: row.recovery,
        sleep: row.sleepPerformance
      })),
    [data]
  );

  const recoveryLoadTrend = React.useMemo(
    () =>
      data.map((row) => ({
        date: row.date,
        strain: row.strain,
        sleepDebt: row.sleepDebtHours,
        hrv: row.hrvRmssd
      })),
    [data]
  );

  const xTickFormatter = (value: string) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return format(date, isMobile ? "M/d" : "MMM d");
  };

  return (
    <section id="history" className="grid gap-3 sm:gap-4">
      <div className="px-1">
        <p className="text-[10px] uppercase tracking-[0.28em] text-ink/55 sm:text-xs">Trends</p>
        <h3 className="font-display text-2xl">Recovery, sleep, and strain</h3>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
          <CardTitle>Readiness trend</CardTitle>
          <p className="text-xs text-ink/60">Recovery and sleep performance over time.</p>
        </CardHeader>
        <CardContent className="h-64 p-2 pt-1 sm:h-72 sm:p-5 sm:pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={readinessTrend} margin={{ top: 8, right: 6, left: isMobile ? -18 : -6, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,17,19,0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={isMobile ? 26 : 20}
                tickFormatter={xTickFormatter}
                interval="preserveStartEnd"
                tick={{ fontSize: 11, fill: "rgba(16,17,19,0.6)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                width={isMobile ? 22 : 30}
                tick={{ fontSize: 11, fill: "rgba(16,17,19,0.6)" }}
              />
              <Tooltip
                formatter={(value: number | string, name: string) => [
                  `${Math.round(Number(value))}%`,
                  name === "recovery" ? "Recovery" : "Sleep Performance"
                ]}
                labelFormatter={(label) => format(new Date(`${label}T00:00:00.000Z`), "EEE, MMM d")}
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 12px 30px rgba(16,17,19,0.15)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
              <Line type="monotone" dataKey="recovery" stroke="#9cf717" strokeWidth={2.8} dot={false} />
              <Line type="monotone" dataKey="sleep" stroke="#1aa8ff" strokeWidth={2.8} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
          <CardTitle>Load management</CardTitle>
          <p className="text-xs text-ink/60">Strain pacing with HRV and sleep debt context.</p>
        </CardHeader>
        <CardContent className="h-64 p-2 pt-1 sm:h-72 sm:p-5 sm:pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={recoveryLoadTrend}
              margin={{ top: 8, right: 6, left: isMobile ? -18 : -6, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,17,19,0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={isMobile ? 26 : 20}
                tickFormatter={xTickFormatter}
                interval="preserveStartEnd"
                tick={{ fontSize: 11, fill: "rgba(16,17,19,0.6)" }}
              />
              <YAxis tickLine={false} axisLine={false} width={isMobile ? 22 : 30} tick={{ fontSize: 11, fill: "rgba(16,17,19,0.6)" }} />
              <Tooltip
                labelFormatter={(label) => format(new Date(`${label}T00:00:00.000Z`), "EEE, MMM d")}
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 12px 30px rgba(16,17,19,0.15)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
              <Line type="monotone" dataKey="strain" name="Strain" stroke="#ff3d86" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="hrv" name="HRV" stroke="#1aa8ff" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="sleepDebt" name="Sleep Debt (h)" stroke="#f5bd00" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}
