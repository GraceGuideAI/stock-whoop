"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { metricDefinitions, type MetricKey } from "@/lib/metrics";
import type { DailyMetricRecord, MetricsResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

const timeframeOptions = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "1Y", value: "1Y" },
  { label: "All", value: "All" }
];

function formatValue(value: number | undefined, unit: string) {
  if (value === undefined || Number.isNaN(value)) return "--";
  const rounded = unit === "" ? value.toFixed(1) : value.toFixed(1);
  if (unit === "%") return `${Math.round(value)}${unit}`;
  if (unit === "h") return `${value.toFixed(1)}${unit}`;
  if (unit === "kcal") return `${Math.round(value)} ${unit}`;
  if (unit === "bpm") return `${Math.round(value)} ${unit}`;
  if (unit === "ms") return `${Math.round(value)} ${unit}`;
  if (unit === "°C") return `${value.toFixed(2)} ${unit}`;
  if (unit === "rpm") return `${value.toFixed(1)} ${unit}`;
  return unit ? `${rounded} ${unit}` : rounded;
}

function computeDelta(current?: number, previous?: number) {
  if (current === undefined || previous === undefined) return null;
  const diff = current - previous;
  const percent = previous === 0 ? null : (diff / previous) * 100;
  return { diff, percent };
}

export function MetricsDashboard() {
  const [timeframe, setTimeframe] = React.useState("1M");
  const [data, setData] = React.useState<DailyMetricRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const celebrated = React.useRef(new Set<MetricKey>());

  const dataWithDate = React.useMemo(
    () =>
      data.map((row) => ({
        ...row,
        dateObj: new Date(row.date)
      })),
    [data]
  );

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/metrics?timeframe=${timeframe}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load metrics");
        return res.json();
      })
      .then((payload: MetricsResponse) => {
        setData(payload.data ?? []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [timeframe]);

  const latest = data[data.length - 1];
  const previous = data[data.length - 2];

  function valueBefore(metric: MetricKey, daysBack: number) {
    if (!latest) return undefined;
    const target = new Date(latest.date);
    target.setDate(target.getDate() - daysBack);
    for (let i = dataWithDate.length - 1; i >= 0; i -= 1) {
      const row = dataWithDate[i];
      if (row.dateObj <= target && typeof row[metric] === "number") {
        return row[metric] as number;
      }
    }
    return undefined;
  }

  const maxByMetric = React.useMemo(() => {
    const max: Partial<Record<MetricKey, number>> = {};
    metricDefinitions.forEach((metric) => {
      const values = data
        .map((row) => row[metric.key])
        .filter((value): value is number => typeof value === "number");
      max[metric.key] = values.length ? Math.max(...values) : undefined;
    });
    return max;
  }, [data]);

  React.useEffect(() => {
    metricDefinitions.forEach((metric) => {
      const current = latest?.[metric.key];
      const maxValue = maxByMetric[metric.key];
      if (
        typeof current === "number" &&
        typeof maxValue === "number" &&
        current === maxValue &&
        !celebrated.current.has(metric.key)
      ) {
        confetti({
          particleCount: 90,
          spread: 70,
          startVelocity: 40,
          origin: { y: 0.7 }
        });
        celebrated.current.add(metric.key);
      }
    });
  }, [latest, maxByMetric]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="sticky top-2 z-20 rounded-2xl bg-white/90 p-2 shadow-card backdrop-blur-lg sm:top-3 sm:p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-ink/55 sm:text-xs">
              WHOOP Portfolio
            </p>
            <h2 className="font-display text-2xl leading-tight sm:text-3xl">
              Performance Market
            </h2>
            <p className="mt-1 text-xs text-ink/65 sm:text-sm">
              {latest?.date
                ? `Last sync: ${format(new Date(latest.date), "MMM d, yyyy")}`
                : "Load your WHOOP data to see live trends."}
            </p>
          </div>
          <ToggleGroup value={timeframe} options={timeframeOptions} onChange={setTimeframe} />
        </div>
      </div>

      <section className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metricDefinitions.slice(0, 6).map((metric) => {
          const value = latest?.[metric.key];
          const delta = computeDelta(value, previous?.[metric.key]);
          const delta1d = computeDelta(value, valueBefore(metric.key, 1));
          const delta1w = computeDelta(value, valueBefore(metric.key, 7));
          const delta1m = computeDelta(value, valueBefore(metric.key, 30));
          const isRecord = typeof value === "number" && value === maxByMetric[metric.key];
          const chartData = data.map((row) => ({
            date: row.date,
            value: row[metric.key]
          }));

          return (
            <Card key={metric.key} className="relative overflow-hidden">
              <div className={cn("absolute left-0 top-0 h-1.5 w-full", metric.accent)} />
              <CardHeader className="p-4 pb-1.5 sm:p-5 sm:pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg">{metric.label}</CardTitle>
                    <p className="text-[11px] text-ink/60 sm:text-xs">{metric.description}</p>
                  </div>
                  {isRecord ? <Badge variant="candy">PR!</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="flex items-end justify-between gap-3 p-4 pt-1.5 sm:p-5 sm:pt-2">
                <div>
                  <p className="text-2xl font-semibold leading-none sm:text-3xl">
                    {formatValue(value, metric.unit)}
                  </p>
                  <p className="mt-1 text-[11px] text-ink/60 sm:text-xs">
                    {delta
                      ? `${delta.diff >= 0 ? "+" : ""}${delta.diff.toFixed(1)}${
                          delta.percent !== null
                            ? ` (${delta.percent >= 0 ? "+" : ""}${delta.percent.toFixed(1)}%)`
                            : ""
                        }`
                      : "No previous data"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-ink/60 sm:gap-2 sm:text-[11px]">
                    {[
                      { label: "1D", delta: delta1d },
                      { label: "1W", delta: delta1w },
                      { label: "1M", delta: delta1m }
                    ].map((item) => (
                      <span key={item.label} className="rounded-full bg-ink/5 px-2 py-1">
                        Δ{item.label}:{" "}
                        {item.delta
                          ? `${item.delta.diff >= 0 ? "+" : ""}${item.delta.diff.toFixed(1)}`
                          : "--"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="h-14 w-24 shrink-0 sm:h-16 sm:w-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line type="monotone" dataKey="value" stroke="#ff3d86" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-3 sm:gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
            <CardTitle>Metric Watchlist</CardTitle>
            <p className="text-xs text-ink/60">Scan your personal market board.</p>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            <div className="space-y-2 px-3 pb-3 sm:hidden">
              {metricDefinitions.map((metric) => {
                const value = latest?.[metric.key];
                const delta = computeDelta(value, previous?.[metric.key]);
                return (
                  <div
                    key={metric.key}
                    className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold">{metric.label}</p>
                      <p className="text-xs text-ink/60">
                        {delta ? `${delta.diff >= 0 ? "+" : ""}${delta.diff.toFixed(1)}` : "--"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatValue(value, metric.unit)}</p>
                      {value === maxByMetric[metric.key] ? (
                        <Badge variant="candy" className="mt-1">
                          Record
                        </Badge>
                      ) : (
                        <Badge variant="sky" className="mt-1">
                          Tracking
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Latest</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricDefinitions.map((metric) => {
                    const value = latest?.[metric.key];
                    const delta = computeDelta(value, previous?.[metric.key]);
                    return (
                      <TableRow key={metric.key}>
                        <TableCell className="font-semibold">{metric.label}</TableCell>
                        <TableCell>{formatValue(value, metric.unit)}</TableCell>
                        <TableCell>
                          {delta ? `${delta.diff >= 0 ? "+" : ""}${delta.diff.toFixed(1)}` : "--"}
                        </TableCell>
                        <TableCell>
                          {value === maxByMetric[metric.key] ? (
                            <Badge variant="candy">Record</Badge>
                          ) : (
                            <Badge variant="sky">Tracking</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card id="insights">
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
            <CardTitle>Market Mood</CardTitle>
            <p className="text-xs text-ink/60">Quick narrative for your trend line.</p>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-2 sm:space-y-4 sm:p-5 sm:pt-2">
            <div className="rounded-2xl bg-skybolt-50 p-3 sm:p-4">
              <p className="text-sm font-semibold">Recovery momentum</p>
              <p className="text-xs text-ink/60">
                {latest?.recovery
                  ? `Recovery is hovering around ${latest.recovery}%. Keep strain aligned.`
                  : "Load data to unlock insights."}
              </p>
            </div>
            <div className="rounded-2xl bg-limepop-50 p-3 sm:p-4">
              <p className="text-sm font-semibold">Sleep trend</p>
              <p className="text-xs text-ink/60">
                {latest?.sleepPerformance
                  ? `Sleep performance sits near ${latest.sleepPerformance}%.`
                  : "No sleep data yet."}
              </p>
            </div>
            <div className="rounded-2xl bg-candy-50 p-3 sm:p-4">
              <p className="text-sm font-semibold">Strain balance</p>
              <p className="text-xs text-ink/60">
                {latest?.strain ? `Today’s strain is ${latest.strain.toFixed(1)}.` : "Strain data incoming."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="history" className="grid gap-3 sm:gap-4">
        <div className="px-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-ink/55 sm:text-xs">History</p>
          <h3 className="font-display text-2xl">Trend charts</h3>
        </div>

        {metricDefinitions.map((metric) => {
          const chartData = data.map((row) => ({
            date: row.date,
            value: row[metric.key]
          }));

          return (
            <Card key={metric.key}>
              <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
                <CardTitle>{metric.label} Trend</CardTitle>
                <p className="text-xs text-ink/60">{metric.description}</p>
              </CardHeader>
              <CardContent className="h-48 p-2 pt-1 sm:h-64 sm:p-5 sm:pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} hide />
                    <YAxis tickLine={false} axisLine={false} width={28} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 12px 30px rgba(16,17,19,0.15)"
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#1aa8ff" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-30 flex justify-center sm:hidden">
        <div className="pointer-events-auto rounded-full bg-white/90 p-1.5 shadow-card backdrop-blur-lg">
          <Button size="sm" variant="outline" onClick={() => document.getElementById("history")?.scrollIntoView({ behavior: "smooth" })}>
            Jump to history
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white/80 p-4 text-center text-sm text-ink/60 sm:rounded-3xl sm:p-6">
          Loading metrics...
        </div>
      ) : null}
    </div>
  );
}
