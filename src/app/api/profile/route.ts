
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadDb, saveDb } from '@/lib/store';
import { z } from 'zod';

export const runtime = 'nodejs';

const profileUpdateSchema = z.object({
  username: z.string().min(2).max(30).optional(),
  avatar: z.string().url().or(z.string().startsWith("data:image/")).optional(),
});

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const db = loadDb();
  const userIndex = db.users.findIndex(u => u.id === session.user.id);
  if (userIndex === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }
  
  const json = await request.json();
  const parsed = profileUpdateSchema.safeParse(json);

  if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parsed.error.errors }, { status: 400 });
  }

  const currentUserData = db.users[userIndex];
  
  // Merge new data with existing data
  const updatedUserData = { 
    ...currentUserData, 
    ...parsed.data 
  };
  
  db.users[userIndex] = updatedUserData;
  saveDb(db);
  
  // Return the updated user object, omitting the password
  const { password, ...userToReturn } = updatedUserData;

  return NextResponse.json(userToReturn, { status: 200 });
}
