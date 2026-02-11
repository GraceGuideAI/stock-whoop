import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 pb-16 pt-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-candy-500 text-xl font-bold text-white shadow-glow">
              W
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Stock-WHOOP</p>
              <h1 className="font-display text-2xl">Portfolio of You</h1>
            </div>
          </div>
          <Badge variant="lime">Live Metrics</Badge>
        </header>

        <section className="grid gap-10 rounded-[32px] bg-white/80 p-8 shadow-card backdrop-blur-lg md:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-6">
            <p className="font-display text-4xl leading-tight md:text-5xl">
              Turn WHOOP stats into a colorful market dashboard.
            </p>
            <p className="text-lg text-ink/70">
              Stock-WHOOP reframes recovery, sleep, strain, and heart metrics as a joyful
              portfolio. Celebrate personal records, spot trends fast, and keep your health
              ticker flying high.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard#insights">See Insights</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="candy">Recharts</Badge>
              <Badge variant="sky">shadcn/ui</Badge>
              <Badge variant="lime">Prisma + SQLite</Badge>
            </div>
          </div>
          <div className="gradient-border">
            <div className="flex h-full flex-col gap-4 rounded-[24px] bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink/60">Today&apos;s Standouts</p>
                <Badge variant="sky">+12% week</Badge>
              </div>
              <div className="grid gap-4">
                <div className="rounded-2xl bg-limepop-100 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-limepop-700">Recovery</p>
                  <p className="text-2xl font-bold">79%</p>
                  <p className="text-xs text-limepop-700">Personal record streak</p>
                </div>
                <div className="rounded-2xl bg-skybolt-100 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-skybolt-700">Sleep</p>
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-xs text-skybolt-700">+6% over last night</p>
                </div>
                <div className="rounded-2xl bg-candy-100 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-candy-700">Strain</p>
                  <p className="text-2xl font-bold">13.0</p>
                  <p className="text-xs text-candy-700">Loaded, not overloaded</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Portfolio Summary",
              copy: "Track daily wins with sparkline cards and quick deltas."
            },
            {
              title: "Watchlist Table",
              copy: "Scan the market board for recovery, HRV, and more."
            },
            {
              title: "Confetti Moments",
              copy: "Celebrate personal records with delightfully loud visuals."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl bg-white/80 p-6 shadow-card backdrop-blur-lg"
            >
              <p className="font-display text-xl">{item.title}</p>
              <p className="mt-2 text-sm text-ink/70">{item.copy}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
