import type { Server as HttpServer } from 'http';
import { Server, type Socket } from 'socket.io';
import { taskStore } from './store';
import type { WSMessage } from './realtime-types';

export function createSocketServer(httpServer: HttpServer) {
  const origins = normalizeOrigins(process.env.WS_CORS_ORIGIN);
  const io = new Server(httpServer, {
    cors: {
      origin: origins,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    const clientId = socket.id;

    const state = taskStore.getState();
    socket.emit('message', {
      type: 'sync:tasks',
      payload: state,
      timestamp: Date.now(),
    });

    socket.on('message', (message: WSMessage) => {
      handleMessage(message, socket, io, clientId);
    });
  });

  return io;
}

function normalizeOrigins(value?: string) {
  if (!value) return true;
  const origins = value
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : true;
}

function handleMessage(
  message: WSMessage,
  socket: Socket,
  io: Server,
  clientId: string
) {
  try {
    switch (message.type) {
      case 'task:create': {
        const { title, columnId, description, priority, category, attachments } = message.payload;
        const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const tasks = taskStore.getTasksByColumn(columnId);
        const position = tasks.length;

        const task = taskStore.addTask(
          taskId,
          title,
          columnId,
          position,
          description,
          priority,
          category,
          attachments
        );
        broadcastMessage(io, {
          type: 'task:create',
          payload: task,
          clientId,
          timestamp: Date.now(),
        }, socket);
        break;
      }

      case 'task:update': {
        const { id, ...updates } = message.payload;
        const task = taskStore.updateTask(id, updates);
        if (task) {
          broadcastMessage(io, {
            type: 'task:update',
            payload: task,
            clientId,
            timestamp: Date.now(),
          }, socket);
        }
        break;
      }

      case 'task:delete': {
        const { id } = message.payload;
        taskStore.deleteTask(id);
        broadcastMessage(io, {
          type: 'task:delete',
          payload: { id },
          clientId,
          timestamp: Date.now(),
        }, socket);
        break;
      }

      case 'task:move': {
        const taskId = message.payload.taskId ?? message.payload.id;
        const { columnId, position } = message.payload;
        const task = taskStore.updateTask(taskId, { columnId, position });
        if (task) {
          broadcastMessage(io, {
            type: 'task:move',
            payload: task,
            clientId,
            timestamp: Date.now(),
          }, socket);
        }
        break;
      }

      case 'column:create': {
        const { title } = message.payload;
        const columnId = `column-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const columns = taskStore.getColumns();
        const position = columns.length;

        const column = taskStore.addColumn(columnId, title, position);
        broadcastMessage(io, {
          type: 'column:create',
          payload: column,
          clientId,
          timestamp: Date.now(),
        }, socket);
        break;
      }

      case 'column:update': {
        const { id, ...updates } = message.payload;
        const column = taskStore.updateColumn(id, updates);
        if (column) {
          broadcastMessage(io, {
            type: 'column:update',
            payload: column,
            clientId,
            timestamp: Date.now(),
          }, socket);
        }
        break;
      }

      case 'column:delete': {
        const { id } = message.payload;
        taskStore.deleteColumn(id);
        broadcastMessage(io, {
          type: 'column:delete',
          payload: { id },
          clientId,
          timestamp: Date.now(),
        }, socket);
        break;
      }

      case 'sync':
      case 'sync:tasks': {
        const state = taskStore.getState();
        socket.emit('message', {
          type: 'sync:tasks',
          payload: state,
          timestamp: Date.now(),
        });
        break;
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

function broadcastMessage(io: Server, message: WSMessage, sender: Socket) {
  sender.emit('message', message);
  sender.broadcast.emit('message', message);
}
