import Link from "next/link";
import { MetricsDashboard } from "@/components/dashboard/metrics-dashboard";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <main className="min-h-screen px-6 pb-16 pt-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-lg font-bold text-white">
              W
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Stock-WHOOP</p>
              <h1 className="font-display text-3xl">Dashboard</h1>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Back to Landing</Link>
          </Button>
        </header>

        <MetricsDashboard />
      </div>
    </main>
  );
}
