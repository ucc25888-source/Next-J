import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDailyTasks } from '@/lib/getDailyTasks';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await getDailyTasks(session.clientId);
  return NextResponse.json(result);
}
