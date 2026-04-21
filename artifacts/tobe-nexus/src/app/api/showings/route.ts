import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query, queryOne } from '@/lib/db';
import type { Showing } from '@/types';
import { dbRowToShowing } from './_utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const buyerId = req.nextUrl.searchParams.get('buyer_id');

  let rows;
  if (buyerId) {
    rows = await query(
      'SELECT * FROM showings WHERE client_id = $1 AND buyer_id = $2 ORDER BY showing_date DESC, created_at DESC',
      [session.clientId, buyerId]
    );
  } else {
    rows = await query(
      'SELECT * FROM showings WHERE client_id = $1 ORDER BY showing_date DESC, created_at DESC',
      [session.clientId]
    );
  }

  return NextResponse.json({ showings: rows.map(dbRowToShowing) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Partial<Showing & { buyer_id?: string }>;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const row = await queryOne(
    `INSERT INTO showings (
      id, client_id, buyer_id, property_id, showing_date,
      buyer_name, buyer_phone, buyer_source, reaction,
      offer_wan, follow_up, follow_up_date, follow_up_done, notes, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [
      id, session.clientId,
      body.buyer_id || null, body.property_id || null,
      body.showing_date ?? new Date().toISOString().slice(0, 10),
      body.buyer_name ?? '', body.buyer_phone ?? '', body.buyer_source ?? '平台',
      body.reaction ?? '有點興趣',
      Number(body.offer_wan) || 0,
      body.follow_up ?? '',
      body.follow_up_date || null,
      false,
      body.notes ?? '',
      now,
    ]
  );

  return NextResponse.json({ showing: dbRowToShowing(row as Record<string, unknown>) }, { status: 201 });
}
