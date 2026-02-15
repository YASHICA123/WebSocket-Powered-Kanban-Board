import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Board } from '@/components/board';

// Mock the WebSocket hook
vi.mock('@/hooks/use-websocket', () => ({
  useWebSocket: (onMessage: (msg: any) => void) => {
    // Simulate receiving initial sync message
    setTimeout(() => {
      onMessage({
        type: 'sync:tasks',
        payload: {
          columns: [
            { id: 'todo', title: 'To Do', position: 0 },
            { id: 'in-progress', title: 'In Progress', position: 1 },
            { id: 'done', title: 'Done', position: 2 },
          ],
          tasks: [
            {
              id: 'task-1',
              title: 'Test Task',
              columnId: 'todo',
              position: 0,
              description: undefined,
              priority: 'medium',
              category: 'feature',
              attachments: [],
            },
          ],
        },
      });
    }, 0);

    return {
      send: vi.fn(),
      isConnected: true,
      ws: null,
    };
  },
}));

describe('Board Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(<Board />);
    expect(screen.getByText(/Connecting to board/i)).toBeInTheDocument();
  });

  it('should render board title and description', async () => {
    render(<Board />);
    
    await waitFor(() => {
      expect(screen.getByText('Kanban Board')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Drag and drop tasks to organize your work/i)).toBeInTheDocument();
  });

  it('should render columns after connection', async () => {
    render(<Board />);
    
    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  it('should display tasks in correct column', async () => {
    render(<Board />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('should show task count in column header', async () => {
    render(<Board />);
    
    await waitFor(() => {
      expect(screen.getByText('1 tasks')).toBeInTheDocument();
    });
  });
});
