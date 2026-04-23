import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query, queryOne } from '@/lib/db';
import { dbRowToBuyer } from '../_utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const row = await queryOne('SELECT * FROM buyers WHERE id = $1 AND client_id = $2', [id, session.clientId]);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(dbRowToBuyer(row as Record<string, unknown>));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const now = new Date().toISOString();

  await query(
    `UPDATE buyers SET
      name=$1, phone=$2, email=$3, line_id=$4, source=$5,
      budget_min=$6, budget_max=$7, pref_property_type=$8, pref_area=$9,
      pref_rooms=$10, pref_min_ping=$11, status=$12, notes=$13,
      last_contact_at=$14, next_follow_up_date=$15, updated_at=$16
    WHERE id=$17 AND client_id=$18`,
    [
      body.name ?? '', body.phone ?? '', body.email ?? '', body.line_id ?? '',
      body.source ?? '平台',
      Number(body.budget_min) || 0, Number(body.budget_max) || 0,
      body.pref_property_type ?? '', body.pref_area ?? '',
      body.pref_rooms ?? '', Number(body.pref_min_ping) || 0,
      body.status ?? '潛在', body.notes ?? '',
      body.last_contact_at || null,
      body.next_follow_up_date || null,
      now, id, session.clientId,
    ]
  );

  const row = await queryOne('SELECT * FROM buyers WHERE id = $1 AND client_id = $2', [id, session.clientId]);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ buyer: dbRowToBuyer(row as Record<string, unknown>) });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as { next_follow_up_date?: string | null; notes?: string };
  const now = new Date().toISOString();

  if (body.notes !== undefined) {
    await query(
      `UPDATE buyers SET next_follow_up_date=$1, notes=$2, last_contact_at=$3, updated_at=$4 WHERE id=$5 AND client_id=$6`,
      [body.next_follow_up_date || null, body.notes, now.slice(0, 10), now, id, session.clientId]
    );
  } else {
    await query(
      `UPDATE buyers SET next_follow_up_date=$1, updated_at=$2 WHERE id=$3 AND client_id=$4`,
      [body.next_follow_up_date || null, now, id, session.clientId]
    );
  }

  const row = await queryOne('SELECT * FROM buyers WHERE id = $1 AND client_id = $2', [id, session.clientId]);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ buyer: dbRowToBuyer(row as Record<string, unknown>) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await query('DELETE FROM buyers WHERE id = $1 AND client_id = $2', [id, session.clientId]);
  return NextResponse.json({ ok: true });
}
