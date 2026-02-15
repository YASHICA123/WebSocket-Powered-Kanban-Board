import Link from 'next/link';
import { Board } from '@/components/board';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', href: '/tasks', badge: '3' },
  { label: 'Analytics', href: '#', badge: undefined },
  { label: 'Organization', href: '#', badge: undefined },
  { label: 'Projects', href: '#', badge: '12' },
  { label: 'Products', href: '#', badge: undefined },
  { label: 'Orders', href: '#', badge: '5' },
  { label: 'Customers', href: '#', badge: undefined },
  { label: 'Transactions', href: '#', badge: undefined },
  { label: 'Invoices', href: '#', badge: '2' },
];

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="hidden min-h-screen w-64 border-r border-border/70 bg-card/80 px-6 py-8 lg:block">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/90" />
            <div>
              <p className="text-sm font-semibold text-foreground">Studio</p>
              <p className="text-xs text-muted-foreground">Kanban Workspace</p>
            </div>
          </div>

          <div className="mt-8 space-y-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Overview</div>
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
            <p className="mt-2 text-lg font-semibold text-foreground">Aligned</p>
            <p className="text-xs text-muted-foreground">Team sync is healthy</p>
          </div>
        </aside>

        <main className="flex-1">
          <div className="border-b border-border/70 bg-card/80 px-6 py-6">
            <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tasks</p>
                <h1 className="font-display text-2xl font-semibold text-foreground">Team Board</h1>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="rounded-full">Import</Button>
                <Button size="sm" className="rounded-full">New Task</Button>
              </div>
            </div>
          </div>

          <Board />
        </main>
      </div>
    </div>
  );
}
