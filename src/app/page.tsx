import { MetricsDashboard } from "@/components/dashboard/metrics-dashboard";
import { Badge } from "@/components/ui/badge";
import { getMetricsByTimeframe } from "@/lib/whoop";

export default function HomePage() {
  const initialData = getMetricsByTimeframe("1M");

  return (
    <main className="min-h-screen px-4 pb-24 pt-4 sm:px-5 sm:pt-5">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-6">
        <header className="rounded-3xl bg-white/85 p-4 shadow-card backdrop-blur-lg sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-candy-500 text-lg font-bold text-white shadow-glow">
                H
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-ink/50 sm:text-xs">Performance Health</p>
                <h1 className="font-display text-2xl leading-none sm:text-3xl">Recovery Terminal</h1>
              </div>
            </div>
            <Badge variant="lime" className="shrink-0">
              Daily Sync
            </Badge>
          </div>
        </header>

        <MetricsDashboard initialData={initialData} initialTimeframe="1M" />
      </div>
    </main>
  );
}
