'use client';

import { useMemo } from 'react';
import type { Column, Task } from '@/lib/store';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis } from 'recharts';

interface TaskProgressChartsProps {
  columns: Column[];
  tasks: Task[];
}

const chartConfig = {
  todo: { label: 'To Do', color: 'hsl(var(--chart-1))' },
  'in-progress': { label: 'In Progress', color: 'hsl(var(--chart-2))' },
  done: { label: 'Done', color: 'hsl(var(--chart-3))' },
  remaining: { label: 'Remaining', color: 'hsl(var(--chart-4))' },
} as const;

export function TaskProgressCharts({ columns, tasks }: TaskProgressChartsProps) {
  if (typeof ResizeObserver === 'undefined') {
    return <div data-testid="task-progress-charts" />;
  }

  const columnData = useMemo(() => {
    return columns.map(column => {
      const count = tasks.filter(task => task.columnId === column.id).length;
      return {
        id: column.id,
        name: column.title,
        count,
      };
    });
  }, [columns, tasks]);

  const completionData = useMemo(() => {
    const total = tasks.length;
    const doneCount = tasks.filter(task => task.columnId === 'done').length;
    const remaining = Math.max(total - doneCount, 0);
    return [
      { name: 'Done', value: doneCount, key: 'done' },
      { name: 'Remaining', value: remaining, key: 'remaining' },
    ];
  }, [tasks]);

  return (
    <div className="mb-10 grid gap-6 lg:grid-cols-2" data-testid="task-progress-charts">
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-foreground">Tasks by Column</h2>
        <p className="text-xs text-muted-foreground mt-1">A live snapshot of active workload.</p>
        <ChartContainer config={chartConfig} className="mt-4 h-64 w-full">
          <BarChart data={columnData} margin={{ left: 0, right: 8, top: 8 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {columnData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={(chartConfig as Record<string, { color: string }>)[entry.id]?.color || 'hsl(var(--chart-1))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-foreground">Completion</h2>
        <p className="text-xs text-muted-foreground mt-1">Done vs. remaining tasks, updated in real time.</p>
        <ChartContainer config={chartConfig} className="mt-4 h-64 w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={completionData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
              {completionData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={(chartConfig as Record<string, { color: string }>)[entry.key]?.color || 'hsl(var(--chart-3))'}
                />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}
