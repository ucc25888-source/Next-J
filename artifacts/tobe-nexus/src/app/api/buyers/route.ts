import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query, queryOne } from '@/lib/db';
import type { Buyer } from '@/types';

function dbRowToBuyer(row: Record<string, unknown>): Buyer {
  return {
    id: row.id as string,
    client_id: row.client_id as string,
    name: (row.name as string) ?? '',
    phone: (row.phone as string) ?? '',
    email: (row.email as string) ?? '',
    line_id: (row.line_id as string) ?? '',
    source: (row.source as string) ?? '平台',
    budget_min: Number(row.budget_min) ?? 0,
    budget_max: Number(row.budget_max) ?? 0,
    pref_property_type: (row.pref_property_type as string) ?? '',
    pref_area: (row.pref_area as string) ?? '',
    pref_rooms: (row.pref_rooms as string) ?? '',
    pref_min_ping: Number(row.pref_min_ping) ?? 0,
    status: (row.status as string) ?? '潛在',
    notes: (row.notes as string) ?? '',
    last_contact_at: (row.last_contact_at as string) ?? null,
    created_at: (row.created_at as string) ?? new Date().toISOString(),
    updated_at: (row.updated_at as string) ?? new Date().toISOString(),
  };
}

export async function GET() {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await query(
    'SELECT * FROM buyers WHERE client_id = $1 ORDER BY updated_at DESC',
    [session.clientId]
  );

  return NextResponse.json({ buyers: rows.map(dbRowToBuyer) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Partial<Buyer>;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const row = await queryOne(
    `INSERT INTO buyers (
      id, client_id, name, phone, email, line_id, source,
      budget_min, budget_max, pref_property_type, pref_area,
      pref_rooms, pref_min_ping, status, notes, last_contact_at,
      created_at, updated_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
    ) RETURNING *`,
    [
      id, session.clientId,
      body.name ?? '',
      body.phone ?? '',
      body.email ?? '',
      body.line_id ?? '',
      body.source ?? '平台',
      Number(body.budget_min) || 0,
      Number(body.budget_max) || 0,
      body.pref_property_type ?? '',
      body.pref_area ?? '',
      body.pref_rooms ?? '',
      Number(body.pref_min_ping) || 0,
      body.status ?? '潛在',
      body.notes ?? '',
      body.last_contact_at || null,
      now, now,
    ]
  );

  return NextResponse.json({ buyer: dbRowToBuyer(row as Record<string, unknown>) }, { status: 201 });
}
