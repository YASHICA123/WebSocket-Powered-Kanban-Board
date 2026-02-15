export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'bug' | 'feature' | 'enhancement';

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
  priority: TaskPriority;
  category: TaskCategory;
  attachments: TaskAttachment[];
}

export interface Column {
  id: string;
  title: string;
  position: number;
}

export interface BoardState {
  columns: Map<string, Column>;
  tasks: Map<string, Task>;
}

class TaskStore {
  private state: BoardState = {
    columns: new Map(),
    tasks: new Map(),
  };

  constructor() {
    this.initializeDefaultColumns();
  }

  private initializeDefaultColumns() {
    const defaultColumns: Column[] = [
      { id: 'todo', title: 'To Do', position: 0 },
      { id: 'in-progress', title: 'In Progress', position: 1 },
      { id: 'done', title: 'Done', position: 2 },
    ];

    defaultColumns.forEach(col => {
      this.state.columns.set(col.id, col);
    });
  }

  // Column operations
  getColumns(): Column[] {
    return Array.from(this.state.columns.values()).sort((a, b) => a.position - b.position);
  }

  getColumn(id: string): Column | undefined {
    return this.state.columns.get(id);
  }

  addColumn(id: string, title: string, position: number): Column {
    const column: Column = { id, title, position };
    this.state.columns.set(id, column);
    return column;
  }

  updateColumn(id: string, updates: Partial<Column>): Column | undefined {
    const column = this.state.columns.get(id);
    if (column) {
      const updated = { ...column, ...updates };
      this.state.columns.set(id, updated);
      return updated;
    }
    return undefined;
  }

  deleteColumn(id: string): boolean {
    return this.state.columns.delete(id);
  }

  // Task operations
  getTasks(): Task[] {
    return Array.from(this.state.tasks.values());
  }

  getTasksByColumn(columnId: string): Task[] {
    return Array.from(this.state.tasks.values())
      .filter(task => task.columnId === columnId)
      .sort((a, b) => a.position - b.position);
  }

  getTask(id: string): Task | undefined {
    return this.state.tasks.get(id);
  }

  addTask(
    id: string,
    title: string,
    columnId: string,
    position: number,
    description?: string,
    priority: TaskPriority = 'medium',
    category: TaskCategory = 'feature',
    attachments: TaskAttachment[] = []
  ): Task {
    const task: Task = {
      id,
      title,
      description,
      columnId,
      position,
      priority,
      category,
      attachments,
    };
    this.state.tasks.set(id, task);
    return task;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const task = this.state.tasks.get(id);
    if (task) {
      const updated = { ...task, ...updates };
      this.state.tasks.set(id, updated);
      return updated;
    }
    return undefined;
  }

  deleteTask(id: string): boolean {
    return this.state.tasks.delete(id);
  }

  // Get full board state
  getState(): { columns: Column[]; tasks: Task[] } {
    return {
      columns: this.getColumns(),
      tasks: this.getTasks(),
    };
  }

  // Reorder tasks in column
  reorderTasksInColumn(columnId: string, taskIds: string[]): void {
    taskIds.forEach((taskId, index) => {
      const task = this.state.tasks.get(taskId);
      if (task) {
        task.position = index;
        this.state.tasks.set(taskId, task);
      }
    });
  }

  // Create task helper
  createTask(data: any): Task {
    const { title, columnId, description, priority, category, attachments } = data;
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tasks = this.getTasksByColumn(columnId);
    const position = tasks.length;
    return this.addTask(
      id,
      title,
      columnId,
      position,
      description,
      priority,
      category,
      attachments
    );
  }

  // Move task helper
  moveTask(taskId: string, columnId: string, position: number): Task | undefined {
    const task = this.getTask(taskId);
    if (task) {
      task.columnId = columnId;
      task.position = position;
      this.state.tasks.set(taskId, task);
      return task;
    }
    return undefined;
  }
}

export const taskStore = new TaskStore();
