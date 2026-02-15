import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-16 px-6 pb-20 pt-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/90" />
            <span className="text-sm font-semibold tracking-[0.2em] text-muted-foreground">KANBAN</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/tasks" className="transition-colors hover:text-foreground">Tasks</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Teams</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Insights</Link>
          </nav>
          <Button asChild size="sm" className="rounded-full px-5">
            <Link href="/tasks">Open workspace</Link>
          </Button>
        </header>

        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Focus and flow</p>
            <h1 className="font-display text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
              Calm, human-first
              <br />
              collaboration for busy teams.
            </h1>
            <p className="text-base text-muted-foreground">
              Plan with clarity, move work forward, and keep momentum across teams. A streamlined
              Kanban experience tuned for everyday focus.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6">
                <Link href="/tasks">Enter tasks</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link href="/tasks">View live board</Link>
              </Button>
            </div>
          </div>

          <div className="relative isolate">
            <div className="pointer-events-none absolute -left-10 -top-16 hidden -z-10 text-[160px] font-semibold text-muted/30 lg:block">
              FLOW
            </div>
            <div className="relative z-10 overflow-hidden rounded-[28px] border border-border/70 bg-card/80 shadow-lg">
              <div className="studio-preview relative h-72 w-full overflow-hidden">
                <div className="absolute inset-0 p-6">
                  <div className="grid h-full grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm">
                      <div className="h-2 w-20 rounded-full bg-muted/70" />
                      <div className="mt-3 h-20 rounded-xl border border-border/70 bg-background/40" />
                      <div className="mt-3 h-2 w-12 rounded-full bg-muted/50" />
                    </div>
                    <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="h-2 w-14 rounded-full bg-muted/60" />
                        <div className="h-5 w-10 rounded-full border border-border/70 bg-background/40" />
                      </div>
                      <div className="mt-4 h-14 rounded-xl border border-border/70 bg-background/35" />
                      <div className="mt-3 h-2 w-16 rounded-full bg-muted/50" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-border/70 bg-card px-6 py-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Studio preview</p>
                <p className="mt-2 text-lg font-semibold text-foreground">Workspaces that feel composed.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Designed with restraint, crafted for real teams.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 z-10 hidden w-44 rounded-2xl border border-border/70 bg-card p-4 shadow-md lg:block">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Live</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">3.2s</p>
              <p className="text-xs text-muted-foreground">Average sync latency</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Focus lanes',
              body: 'Subtle structure with space to think, not just move cards.',
            },
            {
              title: 'Real-time clarity',
              body: 'Live syncing keeps every teammate aligned without noise.',
            },
            {
              title: 'Measured progress',
              body: 'Charts and signals surface momentum without overwhelming.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
