import { describe, it, expect, beforeEach } from 'vitest';
import { taskStore, type Task, type Column } from '@/lib/store';

describe('TaskStore', () => {
  beforeEach(() => {
    // Reset store between tests
    (taskStore as any).state = {
      columns: new Map(),
      tasks: new Map(),
    };
    (taskStore as any).initializeDefaultColumns();
  });

  describe('Columns', () => {
    it('should initialize with default columns', () => {
      const columns = taskStore.getColumns();
      expect(columns).toHaveLength(3);
      expect(columns[0].title).toBe('To Do');
      expect(columns[1].title).toBe('In Progress');
      expect(columns[2].title).toBe('Done');
    });

    it('should add a new column', () => {
      const column = taskStore.addColumn('custom-col', 'Review', 3);
      expect(column.id).toBe('custom-col');
      expect(column.title).toBe('Review');
      expect(column.position).toBe(3);

      const columns = taskStore.getColumns();
      expect(columns).toHaveLength(4);
    });

    it('should get a column by id', () => {
      const column = taskStore.getColumn('todo');
      expect(column).toBeDefined();
      expect(column?.title).toBe('To Do');
    });

    it('should update a column', () => {
      const updated = taskStore.updateColumn('todo', { title: 'To-Do Items' });
      expect(updated?.title).toBe('To-Do Items');

      const retrieved = taskStore.getColumn('todo');
      expect(retrieved?.title).toBe('To-Do Items');
    });

    it('should delete a column', () => {
      const deleted = taskStore.deleteColumn('todo');
      expect(deleted).toBe(true);
      expect(taskStore.getColumn('todo')).toBeUndefined();
    });
  });

  describe('Tasks', () => {
    it('should add a new task', () => {
      const task = taskStore.addTask('task-1', 'Buy groceries', 'todo', 0, 'Need milk and eggs');
      expect(task.id).toBe('task-1');
      expect(task.title).toBe('Buy groceries');
      expect(task.columnId).toBe('todo');
      expect(task.description).toBe('Need milk and eggs');
      expect(task.priority).toBe('medium');
      expect(task.category).toBe('feature');
      expect(task.attachments).toEqual([]);
    });

    it('should get a task by id', () => {
      taskStore.addTask('task-1', 'Test task', 'todo', 0);
      const task = taskStore.getTask('task-1');
      expect(task?.title).toBe('Test task');
    });

    it('should get tasks by column', () => {
      taskStore.addTask('task-1', 'Task 1', 'todo', 0);
      taskStore.addTask('task-2', 'Task 2', 'todo', 1);
      taskStore.addTask('task-3', 'Task 3', 'in-progress', 0);

      const todoTasks = taskStore.getTasksByColumn('todo');
      expect(todoTasks).toHaveLength(2);
      expect(todoTasks[0].title).toBe('Task 1');

      const inProgressTasks = taskStore.getTasksByColumn('in-progress');
      expect(inProgressTasks).toHaveLength(1);
      expect(inProgressTasks[0].title).toBe('Task 3');
    });

    it('should update a task', () => {
      taskStore.addTask('task-1', 'Original title', 'todo', 0);
      const updated = taskStore.updateTask('task-1', { title: 'Updated title', priority: 'high' });
      expect(updated?.title).toBe('Updated title');
      expect(updated?.priority).toBe('high');
    });

    it('should delete a task', () => {
      taskStore.addTask('task-1', 'Task to delete', 'todo', 0);
      const deleted = taskStore.deleteTask('task-1');
      expect(deleted).toBe(true);
      expect(taskStore.getTask('task-1')).toBeUndefined();
    });

    it('should reorder tasks in a column', () => {
      taskStore.addTask('task-1', 'Task 1', 'todo', 0);
      taskStore.addTask('task-2', 'Task 2', 'todo', 1);
      taskStore.addTask('task-3', 'Task 3', 'todo', 2);

      taskStore.reorderTasksInColumn('todo', ['task-3', 'task-1', 'task-2']);

      const tasks = taskStore.getTasksByColumn('todo');
      expect(tasks[0].id).toBe('task-3');
      expect(tasks[1].id).toBe('task-1');
      expect(tasks[2].id).toBe('task-2');
    });
  });

  describe('Board State', () => {
    it('should return full board state', () => {
      taskStore.addTask('task-1', 'Task 1', 'todo', 0);
      taskStore.addTask('task-2', 'Task 2', 'in-progress', 0);

      const state = taskStore.getState();
      expect(state.columns).toHaveLength(3);
      expect(state.tasks).toHaveLength(2);
    });
  });
});
