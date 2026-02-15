import { NextRequest, NextResponse } from 'next/server';
import { taskStore } from '@/lib/store';

export async function GET() {
  try {
    const columns = taskStore.getColumns();
    const tasks = taskStore.getTasks();
    
    return NextResponse.json({
      columns,
      tasks,
    });
  } catch (error) {
    console.error('[v0] Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...payload } = body;

    let result;
    
    switch (action) {
      case 'createTask':
        result = taskStore.createTask(payload);
        break;
      case 'updateTask':
        result = taskStore.updateTask(payload.id, payload);
        break;
      case 'deleteTask':
        result = taskStore.deleteTask(payload.id);
        break;
      case 'moveTask':
        result = taskStore.moveTask(payload.id, payload.columnId, payload.position);
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      columns: taskStore.getColumns(),
      tasks: taskStore.getTasks(),
    });
  } catch (error) {
    console.error('[v0] Error processing task action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
