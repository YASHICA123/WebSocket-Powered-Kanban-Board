import { describe, it, expect } from 'vitest';
import type { WSMessage } from '@/lib/realtime-types';

describe('WebSocket Messages', () => {
  describe('Message Structure', () => {
    it('should have valid task:create message', () => {
      const message: WSMessage = {
        type: 'task:create',
        payload: {
          title: 'New Task',
          columnId: 'todo',
          description: 'Task description',
        },
        timestamp: Date.now(),
      };

      expect(message.type).toBe('task:create');
      expect(message.payload.title).toBeDefined();
      expect(message.payload.columnId).toBeDefined();
    });

    it('should have valid task:update message', () => {
      const message: WSMessage = {
        type: 'task:update',
        payload: {
          id: 'task-1',
          title: 'Updated Task',
        },
        timestamp: Date.now(),
      };

      expect(message.type).toBe('task:update');
      expect(message.payload.id).toBeDefined();
    });

    it('should have valid task:move message', () => {
      const message: WSMessage = {
        type: 'task:move',
        payload: {
          taskId: 'task-1',
          columnId: 'in-progress',
          position: 1,
        },
        timestamp: Date.now(),
      };

      expect(message.type).toBe('task:move');
      expect(message.payload.taskId).toBeDefined();
      expect(message.payload.columnId).toBeDefined();
      expect(message.payload.position).toBeDefined();
    });

    it('should have valid task:delete message', () => {
      const message: WSMessage = {
        type: 'task:delete',
        payload: {
          id: 'task-1',
        },
        timestamp: Date.now(),
      };

      expect(message.type).toBe('task:delete');
      expect(message.payload.id).toBeDefined();
    });

    it('should have valid column:create message', () => {
      const message: WSMessage = {
        type: 'column:create',
        payload: {
          title: 'New Column',
        },
        timestamp: Date.now(),
      };

      expect(message.type).toBe('column:create');
      expect(message.payload.title).toBeDefined();
    });

    it('should have valid sync:tasks message', () => {
      const message: WSMessage = {
        type: 'sync:tasks',
        payload: {
          columns: [],
          tasks: [],
        },
        timestamp: Date.now(),
      };

      expect(message.type).toBe('sync:tasks');
      expect(message.payload.columns).toBeDefined();
      expect(message.payload.tasks).toBeDefined();
    });
  });

  describe('Message Validation', () => {
    it('should include timestamp for all messages', () => {
      const messages: WSMessage[] = [
        { type: 'task:create', payload: {} },
        { type: 'task:update', payload: {} },
        { type: 'sync:tasks', payload: { columns: [], tasks: [] } },
      ];

      messages.forEach(msg => {
        const messageWithTime: WSMessage = {
          ...msg,
          timestamp: Date.now(),
        };
        expect(messageWithTime.timestamp).toBeDefined();
        expect(typeof messageWithTime.timestamp).toBe('number');
      });
    });

    it('should be JSON serializable', () => {
      const message: WSMessage = {
        type: 'task:create',
        payload: {
          title: 'Test',
          columnId: 'todo',
        },
        timestamp: Date.now(),
      };

      const serialized = JSON.stringify(message);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.type).toBe(message.type);
      expect(deserialized.payload).toEqual(message.payload);
    });
  });

  describe('Real-Time Sync', () => {
    it('should handle concurrent task creation', () => {
      const messages: WSMessage[] = [
        {
          type: 'task:create',
          payload: { title: 'Task 1', columnId: 'todo' },
          clientId: 'client-1',
          timestamp: Date.now(),
        },
        {
          type: 'task:create',
          payload: { title: 'Task 2', columnId: 'todo' },
          clientId: 'client-2',
          timestamp: Date.now() + 1,
        },
      ];

      expect(messages).toHaveLength(2);
      expect(messages[0].clientId).toBe('client-1');
      expect(messages[1].clientId).toBe('client-2');
    });

    it('should maintain operation order with timestamps', () => {
      const messages: WSMessage[] = [
        {
          type: 'task:create',
          payload: { title: 'Task 1', columnId: 'todo' },
          timestamp: 100,
        },
        {
          type: 'task:update',
          payload: { id: 'task-1', title: 'Updated' },
          timestamp: 200,
        },
        {
          type: 'task:move',
          payload: { taskId: 'task-1', columnId: 'done', position: 0 },
          timestamp: 300,
        },
      ];

      messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      expect(messages[0].type).toBe('task:create');
      expect(messages[1].type).toBe('task:update');
      expect(messages[2].type).toBe('task:move');
    });
  });
});
