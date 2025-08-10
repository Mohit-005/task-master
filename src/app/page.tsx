
import DashboardClient from '@/components/dashboard/DashboardClient';
import { getSession } from '@/lib/auth';
import type { User } from '@/types';
import { redirect } from 'next/navigation';
import { loadDb } from '@/lib/store';

export default async function Home() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }
  const db = loadDb();
  const user = db.users.find(u => u.id === session.user.id);
  if (!user) {
    redirect('/login');
  }
  const { password: _omit, ...userToReturn } = user as any;
  return <DashboardClient user={userToReturn as User} />;
}
