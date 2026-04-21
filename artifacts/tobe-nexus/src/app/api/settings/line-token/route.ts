/**
 * /api/settings/line-token
 * Lets a logged-in client save / clear their LINE Notify personal token.
 *
 * PUT { token: string }  — save
 * DELETE               — clear (disable)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

  await queryOne(
    'UPDATE clients SET line_notify_token = $1 WHERE client_id = $2',
    [token, session.clientId]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await queryOne(
    'UPDATE clients SET line_notify_token = NULL WHERE client_id = $1',
    [session.clientId]
  );

  return NextResponse.json({ ok: true });
}
