import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query, getPool } from '@/lib/db';
import type { Buyer } from '@/types';

function dbRowToBuyer(row: Record<string, unknown>): Buyer {
  return {
    id: row.id as string,
    client_id: row.client_id as string,
    buyer_no: (row.buyer_no as string) ?? '',
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

async function nextBuyerNo(clientId: string): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // '20260421'
  const counterKey = `buyer_${clientId}_${dateStr}`;

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO listing_counters (key, value, updated_at)
       VALUES ($1, 1, NOW())
       ON CONFLICT (key) DO UPDATE
       SET value = listing_counters.value + 1, updated_at = NOW()`,
      [counterKey]
    );
    const result = await client.query(
      'SELECT value FROM listing_counters WHERE key = $1',
      [counterKey]
    );
    await client.query('COMMIT');
    const seq = result.rows[0]?.value ?? 1;
    return `B${dateStr}-${String(seq).padStart(2, '0')}`;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
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
  const buyerNo = await nextBuyerNo(session.clientId);

  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO buyers (
      id, client_id, buyer_no, name, phone, email, line_id, source,
      budget_min, budget_max, pref_property_type, pref_area,
      pref_rooms, pref_min_ping, status, notes, last_contact_at,
      created_at, updated_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
    ) RETURNING *`,
    [
      id, session.clientId, buyerNo,
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

  const row = result.rows[0];
  return NextResponse.json({ buyer: dbRowToBuyer(row as Record<string, unknown>) }, { status: 201 });
}
