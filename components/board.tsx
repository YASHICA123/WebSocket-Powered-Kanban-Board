'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { ColumnComponent } from './column';
import { TaskProgressCharts } from './task-progress-charts';
import type { Column, Task, TaskAttachment, TaskCategory, TaskPriority } from '@/lib/store';
import type { WSMessage } from '@/hooks/use-websocket';
import { Loader2 } from 'lucide-react';

export function Board() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter(task => task.columnId === 'todo').length;
    const inProgress = tasks.filter(task => task.columnId === 'in-progress').length;
    const done = tasks.filter(task => task.columnId === 'done').length;
    const attachments = tasks.reduce((count, task) => count + task.attachments.length, 0);
    return { total, todo, inProgress, done, attachments };
  }, [tasks]);

  const handleWSMessage = useCallback((message: WSMessage) => {
    console.log('[v0] Received message:', message.type);

    switch (message.type) {
      case 'sync:tasks':
      case 'sync': {
        const { columns: newColumns, tasks: newTasks } = message.payload;
        setColumns(newColumns);
        setTasks(newTasks);
        setIsSynced(true);
        break;
      }

      case 'task:create': {
        const newTask = message.payload;
        setTasks(prev => [...prev, newTask]);
        break;
      }

      case 'task:update': {
        const updatedTask = message.payload;
        setTasks(prev =>
          prev.map(t => (t.id === updatedTask.id ? updatedTask : t))
        );
        break;
      }

      case 'task:move': {
        const movedTask = message.payload;
        setTasks(prev =>
          prev.map(t => (t.id === movedTask.id ? movedTask : t))
        );
        break;
      }

      case 'task:delete': {
        const { id } = message.payload;
        setTasks(prev => prev.filter(t => t.id !== id));
        break;
      }
    }
  }, []);

  const { send, isConnected: wsConnected } = useWebSocket(handleWSMessage);

  // Update connection status
  useEffect(() => {
    if (!wsConnected && isSynced) {
      setConnectionError(true);
    } else if (wsConnected) {
      setConnectionError(false);
    }
  }, [wsConnected, isSynced]);

  const handleTaskCreate = useCallback(
    (
      title: string,
      description: string | undefined,
      columnId: string,
      priority: TaskPriority,
      category: TaskCategory,
      attachments: TaskAttachment[]
    ) => {
      send({
        type: 'task:create',
        payload: {
          title,
          columnId,
          description,
          priority,
          category,
          attachments,
        },
      });
    },
    [send]
  );

  const handleTaskDelete = useCallback(
    (taskId: string) => {
      send({
        type: 'task:delete',
        payload: {
          id: taskId,
        },
      });
    },
    [send]
  );

  const handleTaskMove = useCallback(
    (taskId: string, columnId: string, position: number) => {
      send({
        type: 'task:move',
        payload: {
          taskId,
          columnId,
          position,
        },
      });
    },
    [send]
  );

  const handleTaskUpdate = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      send({
        type: 'task:update',
        payload: {
          id: taskId,
          ...updates,
        },
      });
    },
    [send]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

    if (taskId) {
      const columnTasks = tasks.filter(t => t.columnId === columnId);
      const position = columnTasks.length;
      handleTaskMove(taskId, columnId, position);
    }
  };

  if (!isSynced) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/70 bg-card/90 px-8 py-6 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Connecting to board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {connectionError && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-6 py-3">
          <p className="text-sm text-destructive">
            Connection lost. Attempting to reconnect...
          </p>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1280px] px-6 pb-10 pt-8">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Realtime workflow</p>
            <h1 className="font-display text-4xl font-semibold text-foreground sm:text-5xl">
              Kanban Board
            </h1>
            <p className="text-base text-muted-foreground">
              Plan, prioritize, and move work forward with a calm, real-time view of your team.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card px-4 py-2 shadow-sm">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                wsConnected ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {wsConnected ? 'Live sync active' : 'Connecting...'}
            </span>
          </div>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{metrics.total}</p>
            <p className="text-xs text-muted-foreground">All active tasks</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">To Do</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{metrics.todo}</p>
            <p className="text-xs text-muted-foreground">Ready to start</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">In Progress</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{metrics.inProgress}</p>
            <p className="text-xs text-muted-foreground">Work in motion</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Done</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{metrics.done}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Files</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{metrics.attachments}</p>
            <p className="text-xs text-muted-foreground">Attached assets</p>
          </div>
        </div>

        <TaskProgressCharts columns={columns} tasks={tasks} />

        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.length > 0 ? (
            columns.map(column => (
              <ColumnComponent
                key={column.id}
                column={column}
                tasks={tasks.filter(t => t.columnId === column.id).sort((a, b) => a.position - b.position)}
                onTaskCreate={handleTaskCreate}
                onTaskDelete={handleTaskDelete}
                onTaskMove={handleTaskMove}
                onTaskUpdate={handleTaskUpdate}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No columns available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
