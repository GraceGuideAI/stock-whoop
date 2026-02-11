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
    let mounted = true;
    setLoading(true);
    fetch(`/api/metrics?timeframe=${timeframe}`)
      .then((res) => res.json())
      .then((payload: MetricsResponse) => {
        if (!mounted) return;
        setData(payload.data ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setData([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-ink/60">WHOOP Portfolio</p>
          <h2 className="font-display text-3xl">Performance Market</h2>
          <p className="mt-2 text-sm text-ink/70">
            {latest?.date
              ? `Last sync: ${format(new Date(latest.date), "MMM d, yyyy")}`
              : "Load your WHOOP data to see live trends."}
          </p>
        </div>
        <ToggleGroup
          value={timeframe}
          options={timeframeOptions}
          onChange={setTimeframe}
        />
      </div>

      <section className="grid gap-5 lg:grid-cols-3">
        {metricDefinitions.slice(0, 6).map((metric) => {
          const value = latest?.[metric.key];
          const delta = computeDelta(value, previous?.[metric.key]);
          const delta1d = computeDelta(value, valueBefore(metric.key, 1));
          const delta1w = computeDelta(value, valueBefore(metric.key, 7));
          const delta1m = computeDelta(value, valueBefore(metric.key, 30));
          const delta1y = computeDelta(value, valueBefore(metric.key, 365));
          const isRecord =
            typeof value === "number" && value === maxByMetric[metric.key];
          const chartData = data.map((row) => ({
            date: row.date,
            value: row[metric.key]
          }));
          return (
            <Card key={metric.key} className="relative overflow-hidden">
              <div className={cn("absolute left-0 top-0 h-2 w-full", metric.accent)} />
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{metric.label}</CardTitle>
                  <p className="text-xs text-ink/60">{metric.description}</p>
                </div>
                {isRecord ? <Badge variant="candy">PR!</Badge> : null}
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold">
                    {formatValue(value, metric.unit)}
                  </p>
                  <p className="text-xs text-ink/60">
                    {delta
                      ? `${delta.diff >= 0 ? "+" : ""}${delta.diff.toFixed(1)}${
                          delta.percent !== null
                            ? ` (${delta.percent >= 0 ? "+" : ""}${delta.percent.toFixed(1)}%)`
                            : ""
                        }`
                      : "No previous data"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ink/60">
                    {[
                      { label: "1D", delta: delta1d },
                      { label: "1W", delta: delta1w },
                      { label: "1M", delta: delta1m },
                      { label: "1Y", delta: delta1y }
                    ].map((item) => (
                      <span
                        key={item.label}
                        className="rounded-full bg-ink/5 px-2 py-1"
                      >
                        Δ{item.label}:{" "}
                        {item.delta
                          ? `${item.delta.diff >= 0 ? "+" : ""}${item.delta.diff.toFixed(1)}`
                          : "--"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="h-16 w-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#ff3d86"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Metric Watchlist</CardTitle>
            <p className="text-xs text-ink/60">Scan your personal market board.</p>
          </CardHeader>
          <CardContent>
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
                        {delta
                          ? `${delta.diff >= 0 ? "+" : ""}${delta.diff.toFixed(1)}`
                          : "--"}
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
          </CardContent>
        </Card>
        <Card id="insights">
          <CardHeader>
            <CardTitle>Market Mood</CardTitle>
            <p className="text-xs text-ink/60">Quick narrative for your trend line.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-skybolt-50 p-4">
              <p className="text-sm font-semibold">Recovery momentum</p>
              <p className="text-xs text-ink/60">
                {latest?.recovery
                  ? `Recovery is hovering around ${latest.recovery}%. Keep strain aligned.`
                  : "Load data to unlock insights."}
              </p>
            </div>
            <div className="rounded-2xl bg-limepop-50 p-4">
              <p className="text-sm font-semibold">Sleep trend</p>
              <p className="text-xs text-ink/60">
                {latest?.sleepPerformance
                  ? `Sleep performance sits near ${latest.sleepPerformance}%.`
                  : "No sleep data yet."}
              </p>
            </div>
            <div className="rounded-2xl bg-candy-50 p-4">
              <p className="text-sm font-semibold">Strain balance</p>
              <p className="text-xs text-ink/60">
                {latest?.strain
                  ? `Today’s strain is ${latest.strain.toFixed(1)}.`
                  : "Strain data incoming."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6">
        {metricDefinitions.map((metric) => {
          const chartData = data.map((row) => ({
            date: row.date,
            value: row[metric.key]
          }));
          return (
            <Card key={metric.key}>
              <CardHeader>
                <CardTitle>{metric.label} Trend</CardTitle>
                <p className="text-xs text-ink/60">{metric.description}</p>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={30} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 12px 30px rgba(16,17,19,0.15)"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#1aa8ff"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {loading ? (
        <div className="rounded-3xl bg-white/80 p-6 text-center text-sm text-ink/60">
          Loading metrics...
        </div>
      ) : null}
    </div>
  );
}
