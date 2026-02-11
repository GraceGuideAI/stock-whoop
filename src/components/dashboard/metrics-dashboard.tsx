"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup } from "@/components/ui/toggle-group";
import type { DailyMetricRecord, MetricsResponse } from "@/lib/types";

const TrendCharts = dynamic(() => import("@/components/dashboard/trend-charts"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-3 sm:gap-4">
      <div className="h-60 animate-pulse rounded-3xl bg-white/70" />
      <div className="h-60 animate-pulse rounded-3xl bg-white/70" />
    </div>
  )
});

const timeframeOptions = [
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "1Y", value: "1Y" },
  { label: "All", value: "All" }
];

function avg(values: Array<number | undefined>) {
  const nums = values.filter((v): v is number => typeof v === "number");
  if (!nums.length) return undefined;
  return nums.reduce((acc, v) => acc + v, 0) / nums.length;
}

function formatValue(value: number | undefined, unit: string) {
  if (value === undefined || Number.isNaN(value)) return "--";
  if (unit === "%") return `${Math.round(value)}%`;
  if (unit === "h") return `${value.toFixed(1)}h`;
  if (unit === "ms") return `${Math.round(value)} ms`;
  if (unit === "bpm") return `${Math.round(value)} bpm`;
  return `${value.toFixed(1)} ${unit}`.trim();
}

function computeDelta(current?: number, previous?: number) {
  if (current === undefined || previous === undefined) return null;
  const diff = current - previous;
  return { diff, up: diff >= 0 };
}

type Props = {
  initialTimeframe?: string;
  initialData?: DailyMetricRecord[];
};

export function MetricsDashboard({ initialTimeframe = "1M", initialData = [] }: Props) {
  const [timeframe, setTimeframe] = React.useState(initialTimeframe);
  const [data, setData] = React.useState<DailyMetricRecord[]>(initialData);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/metrics?timeframe=${timeframe}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load metrics");
        return res.json();
      })
      .then((payload: MetricsResponse) => setData(payload.data ?? []))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [timeframe]);

  const latest = data[data.length - 1];
  const previous = data[data.length - 2];

  const readiness = React.useMemo(() => {
    if (!latest) return undefined;
    return avg([latest.recovery, latest.sleepPerformance]);
  }, [latest]);

  const sleepDebt7d = React.useMemo(
    () => avg(data.slice(-7).map((row) => row.sleepDebtHours)),
    [data]
  );

  const strainTarget = React.useMemo(() => {
    if (!latest?.recovery) return undefined;
    if (latest.recovery >= 67) return "15-18";
    if (latest.recovery >= 34) return "11-14";
    return "6-10";
  }, [latest?.recovery]);

  const coachingInsight = React.useMemo(() => {
    if (!latest) return "Load your WHOOP data to generate coaching guidance.";

    if ((latest.sleepDebtHours ?? 0) > 2.5) {
      return "Sleep debt is elevated. Prioritize bedtime consistency and cap strain to moderate today.";
    }

    if ((latest.recovery ?? 0) >= 67 && (latest.strain ?? 0) < 12) {
      return "You look primed. Consider a progressive strain build while recovery is in the green.";
    }

    if ((latest.recovery ?? 0) < 34) {
      return "Readiness is low. Keep intensity light and focus on hydration plus earlier sleep.";
    }

    return "Balanced day. Match strain to recovery and defend sleep to keep momentum.";
  }, [latest]);

  const keyCards = [
    {
      label: "Readiness",
      value: formatValue(readiness, "%"),
      helper: "Recovery + sleep performance",
      delta: computeDelta(readiness, avg([previous?.recovery, previous?.sleepPerformance])),
      color: "bg-limepop-400"
    },
    {
      label: "Recovery",
      value: formatValue(latest?.recovery, "%"),
      helper: "Autonomic bounce-back",
      delta: computeDelta(latest?.recovery, previous?.recovery),
      color: "bg-limepop-500"
    },
    {
      label: "Sleep Debt",
      value: formatValue(latest?.sleepDebtHours, "h"),
      helper: `7d avg ${formatValue(sleepDebt7d, "h")}`,
      delta: computeDelta(latest?.sleepDebtHours, previous?.sleepDebtHours),
      color: "bg-sunshine-500"
    },
    {
      label: "Strain",
      value: latest?.strain?.toFixed(1) ?? "--",
      helper: `Target band ${strainTarget ?? "--"}`,
      delta: computeDelta(latest?.strain, previous?.strain),
      color: "bg-candy-500"
    }
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="sticky top-2 z-20 rounded-2xl bg-white/90 p-2 shadow-card backdrop-blur-lg sm:top-3 sm:p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-ink/55 sm:text-xs">Health cockpit</p>
            <h2 className="font-display text-2xl leading-tight sm:text-3xl">Daily decision board</h2>
            <p className="mt-1 text-xs text-ink/65 sm:text-sm">
              {latest?.date
                ? `Last sync: ${format(new Date(`${latest.date}T00:00:00.000Z`), "MMM d, yyyy")}`
                : "Load your WHOOP data to see live trends."}
            </p>
          </div>
          <ToggleGroup value={timeframe} options={timeframeOptions} onChange={setTimeframe} />
        </div>
      </div>

      <section className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        {keyCards.map((card) => (
          <Card key={card.label} className="relative overflow-hidden">
            <div className={`absolute left-0 top-0 h-1.5 w-full ${card.color}`} />
            <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
              <CardTitle className="text-base">{card.label}</CardTitle>
              <p className="text-xs text-ink/60">{card.helper}</p>
            </CardHeader>
            <CardContent className="p-4 pt-1 sm:p-5 sm:pt-1">
              <p className="text-3xl font-semibold leading-none">{card.value}</p>
              <p className="mt-2 text-xs text-ink/60">
                {card.delta
                  ? `${card.delta.up ? "+" : ""}${card.delta.diff.toFixed(1)} vs prior day`
                  : "No prior day comparison"}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-3 sm:gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
            <CardTitle>Session plan</CardTitle>
            <p className="text-xs text-ink/60">Actionable pacing for training and recovery.</p>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-2 sm:p-5 sm:pt-2">
            <div className="rounded-2xl bg-limepop-50 p-3">
              <p className="text-sm font-semibold">Readiness lane</p>
              <p className="text-xs text-ink/65">
                Aim for strain <span className="font-semibold">{strainTarget ?? "--"}</span> based on current recovery.
              </p>
            </div>
            <div className="rounded-2xl bg-skybolt-50 p-3">
              <p className="text-sm font-semibold">Sleep guardrail</p>
              <p className="text-xs text-ink/65">
                Sleep performance is {formatValue(latest?.sleepPerformance, "%")}. Keep wake time consistent to lower debt.
              </p>
            </div>
            <div className="rounded-2xl bg-candy-50 p-3">
              <p className="text-sm font-semibold">Coaching insight</p>
              <p className="text-xs text-ink/65">{coachingInsight}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
            <CardTitle>Vitals snapshot</CardTitle>
            <p className="text-xs text-ink/60">Signals that explain trend direction.</p>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-2 sm:p-5 sm:pt-2">
            {[
              ["HRV", formatValue(latest?.hrvRmssd, "ms")],
              ["RHR", formatValue(latest?.rhr, "bpm")],
              ["Respiratory", formatValue(latest?.respiratoryRate, "rpm")],
              ["Skin temp", formatValue(latest?.skinTempC, "°C")]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-ink/10 px-3 py-2.5">
                <p className="text-sm text-ink/75">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {data.length > 0 ? <TrendCharts data={data} /> : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-30 flex justify-center sm:hidden">
        <div className="pointer-events-auto rounded-full bg-white/90 p-1.5 shadow-card backdrop-blur-lg">
          <Button size="sm" variant="outline" onClick={() => document.getElementById("history")?.scrollIntoView({ behavior: "smooth" })}>
            Jump to trends
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white/80 p-3 text-center text-xs text-ink/60 sm:rounded-3xl sm:p-4 sm:text-sm">
          Refreshing latest metrics…
        </div>
      ) : null}

      <div className="flex justify-end">
        <Badge variant="sky" className="text-[11px]">
          Health-first layout · stock-inspired signals
        </Badge>
      </div>
    </div>
  );
}
