'use client';

import { useEffect, useState } from 'react';
import { Pencil, Save, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import type { Task } from '@/lib/store';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const priorityClasses: Record<Task['priority'], string> = {
  low: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  high: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
};

export function TaskCard({ task, onDragStart, onDelete, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [category, setCategory] = useState<Task['category']>(task.category);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setCategory(task.category);
  }, [task]);

  const handleSave = () => {
    if (!title.trim()) return;
    onUpdate(task.id, {
      title,
      description: description || undefined,
      priority,
      category,
    });
    setIsEditing(false);
  };

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      className="group rounded-lg border border-border/70 bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm"
                placeholder="Task title"
              />
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm"
                placeholder="Description (optional)"
              />
              <div className="grid grid-cols-2 gap-2">
                <Select value={priority} onValueChange={(value) => setPriority(value as Task['priority'])}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={category} onValueChange={(value) => setCategory(value as Task['category'])}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="enhancement">Enhancement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-medium text-sm break-words text-foreground">{task.title}</h3>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </>
          )}

          {!isEditing && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className={priorityClasses[task.priority]}>
                {task.priority}
              </Badge>
              <Badge variant="secondary">{task.category}</Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-6 w-6 p-0"
              >
                <Save className="h-3 w-3 text-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>

      {task.attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Attachments</p>
          <div className="grid grid-cols-2 gap-2">
            {task.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 rounded-md border border-muted/60 bg-muted/30 p-2 text-xs"
              >
                {attachment.url ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-muted" />
                )}
                <span className="truncate" title={attachment.name}>
                  {attachment.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
