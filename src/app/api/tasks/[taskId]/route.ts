export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadDb, saveDb } from '@/lib/store';
import { z } from 'zod';

const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).optional(),
  boardId: z.string().optional(), // for moving tasks between boards
});

async function authorizeTaskAccess(taskId: string, userId: string) {
    const db = await loadDb();
    const task = db.tasks.find(t => t.id === taskId);
    if (!task) return null;

    const board = db.boards.find(b => b.id === task.boardId);
    if (!board || board.userId !== userId) return null;

    return task;
}


export async function PUT(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const { taskId } = (params as { taskId: string });
  const task = await authorizeTaskAccess(taskId, session.user.id);
  if (!task) {
    return NextResponse.json({ message: 'Task not found or forbidden' }, { status: 404 });
  }
  
  const json = await request.json();
  const parsed = taskUpdateSchema.safeParse(json);

  if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parsed.error.errors }, { status: 400 });
  }

  const db = await loadDb();
  const { taskId } = (params as { taskId: string });
  const taskIndex = db.tasks.findIndex(t => t.id === taskId);
  const updatedTask = { ...db.tasks[taskIndex], ...parsed.data };
  db.tasks[taskIndex] = updatedTask;
  await saveDb(db);

  return NextResponse.json(updatedTask, { status: 200 });
}

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const { taskId: delTaskId } = (params as { taskId: string });
  const task = await authorizeTaskAccess(delTaskId, session.user.id);
  if (!task) {
    return NextResponse.json({ message: 'Task not found or forbidden' }, { status: 404 });
  }

  const db = await loadDb();
  const delIndex = db.tasks.findIndex(t => t.id === delTaskId);
  db.tasks.splice(delIndex, 1);
  await saveDb(db);

  return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
}
