'use client';

import { useState } from 'react';
import { Plus, MoreVertical, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { TaskCard } from './task-card';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type {
  Column,
  Task,
  TaskAttachment,
  TaskCategory,
  TaskPriority,
} from '@/lib/store';

interface ColumnProps {
  column: Column;
  tasks: Task[];
  onTaskCreate: (
    title: string,
    description: string | undefined,
    columnId: string,
    priority: TaskPriority,
    category: TaskCategory,
    attachments: TaskAttachment[]
  ) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskMove: (taskId: string, columnId: string, position: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export function ColumnComponent({
  column,
  tasks,
  onTaskCreate,
  onTaskDelete,
  onTaskUpdate,
  onTaskMove,
  onDragOver,
  onDrop,
}: ColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('feature');
  const [taskAttachments, setTaskAttachments] = useState<TaskAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const allowedFileTypes = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'application/pdf',
  ]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const fileToAttachment = async (file: File): Promise<TaskAttachment> => {
    const isImage = file.type.startsWith('image/');
    const url = isImage ? await readFileAsDataUrl(file) : '';
    return {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url,
    };
  };

  const handleAddTask = async () => {
    if (taskTitle.trim()) {
      onTaskCreate(
        taskTitle,
        taskDescription || undefined,
        column.id,
        taskPriority,
        taskCategory,
        taskAttachments
      );
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');
      setTaskCategory('feature');
      setTaskAttachments([]);
      setAttachmentError(null);
      setIsAddingTask(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const invalid = files.find(file => !allowedFileTypes.has(file.type));
    if (invalid) {
      setAttachmentError(`Unsupported file type: ${invalid.name}`);
      event.target.value = '';
      return;
    }

    setAttachmentError(null);
    const newAttachments = await Promise.all(files.map(fileToAttachment));
    setTaskAttachments(prev => [...prev, ...newAttachments]);
    event.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setTaskTitle('');
      setTaskDescription('');
    }
  };

  return (
    <div className="flex-shrink-0 w-[320px] flex flex-col gap-4">
      <Card className="flex-1 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{column.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">{tasks.length} tasks</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div
          onDragOver={onDragOver}
          onDrop={onDrop}
          data-column-id={column.id}
          className="flex-1 space-y-3 overflow-y-auto pr-2 mb-4 min-h-[320px] rounded-lg border border-dashed border-border/70 bg-muted/40 p-3 transition-colors hover:bg-muted/60"
        >
          {tasks.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Drop tasks here
            </div>
          )}
          {tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('taskId', task.id);
                e.dataTransfer.setData('sourceColumnId', column.id);
              }}
            >
              <TaskCard
                task={task}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('taskId', task.id);
                  e.dataTransfer.setData('sourceColumnId', column.id);
                }}
                onDelete={onTaskDelete}
                onUpdate={onTaskUpdate}
              />
            </div>
          ))}
        </div>

        {isAddingTask ? (
          <div className="space-y-2">
            <Input
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-sm"
            />
            <Input
              placeholder="Description (optional)"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={taskPriority} onValueChange={(value) => setTaskPriority(value as TaskPriority)}>
                <SelectTrigger className="text-sm" data-testid="priority-select">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={taskCategory} onValueChange={(value) => setTaskCategory(value as TaskCategory)}>
                <SelectTrigger className="text-sm" data-testid="category-select">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="enhancement">Enhancement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
                className="text-sm"
                data-testid="attachment-input"
              />
              {attachmentError && (
                <p className="text-xs text-destructive">{attachmentError}</p>
              )}
              {taskAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {taskAttachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                    >
                      <span className="max-w-[120px] truncate">{attachment.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() =>
                          setTaskAttachments(prev =>
                            prev.filter(item => item.id !== attachment.id)
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddTask}
                className="flex-1"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingTask(false);
                  setTaskTitle('');
                  setTaskDescription('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </Card>
    </div>
  );
}
