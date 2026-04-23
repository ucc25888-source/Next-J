import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query, queryOne } from '@/lib/db';
import { dbRowToShowing } from '../_utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const row = await queryOne(
    `SELECT s.*, p.subarea, p.property_type, p.listing_id
     FROM showings s
     LEFT JOIN properties p ON p.id = s.property_id
     WHERE s.id = $1 AND s.client_id = $2`,
    [id, session.clientId]
  );
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(dbRowToShowing(row as Record<string, unknown>));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  await query(
    `UPDATE showings SET
      showing_date=$1, property_id=$2, reaction=$3,
      offer_wan=$4, follow_up=$5, follow_up_date=$6, notes=$7
    WHERE id=$8 AND client_id=$9`,
    [
      body.showing_date ?? new Date().toISOString().slice(0, 10),
      body.property_id || null,
      body.reaction ?? '有點興趣',
      Number(body.offer_wan) || 0,
      body.follow_up ?? '',
      body.follow_up_date || null,
      body.notes ?? '',
      id,
      session.clientId,
    ]
  );

  const row = await queryOne('SELECT * FROM showings WHERE id = $1 AND client_id = $2', [id, session.clientId]);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ showing: dbRowToShowing(row as Record<string, unknown>) });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as { follow_up_done?: boolean; follow_up?: string; notes?: string };

  if (body.follow_up !== undefined) {
    await query(
      `UPDATE showings SET follow_up_done=$1, follow_up=$2 WHERE id=$3 AND client_id=$4`,
      [body.follow_up_done ?? true, body.follow_up, id, session.clientId]
    );
  } else if (body.notes !== undefined) {
    await query(
      `UPDATE showings SET follow_up_done=$1, notes=$2 WHERE id=$3 AND client_id=$4`,
      [body.follow_up_done ?? true, body.notes, id, session.clientId]
    );
  } else {
    await query(
      `UPDATE showings SET follow_up_done=$1 WHERE id=$2 AND client_id=$3`,
      [body.follow_up_done ?? true, id, session.clientId]
    );
  }

  const row = await queryOne('SELECT * FROM showings WHERE id = $1 AND client_id = $2', [id, session.clientId]);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ showing: dbRowToShowing(row as Record<string, unknown>) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await query('DELETE FROM showings WHERE id = $1 AND client_id = $2', [id, session.clientId]);
  return NextResponse.json({ ok: true });
}
