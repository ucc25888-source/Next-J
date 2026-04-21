import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query, getPool } from '@/lib/db';
import type { Buyer } from '@/types';
import { dbRowToBuyer } from './_utils';

export const dynamic = 'force-dynamic';

async function nextBuyerNo(clientId: string): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const counterKey = `buyer_${clientId}_${dateStr}`;

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO listing_counters (key, value, updated_at) VALUES ($1, 1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = listing_counters.value + 1, updated_at = NOW()`,
      [counterKey]
    );
    const result = await client.query('SELECT value FROM listing_counters WHERE key = $1', [counterKey]);
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

  const rows = await query('SELECT * FROM buyers WHERE client_id = $1 ORDER BY updated_at DESC', [session.clientId]);
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
      next_follow_up_date, created_at, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING *`,
    [
      id, session.clientId, buyerNo,
      body.name ?? '', body.phone ?? '', body.email ?? '', body.line_id ?? '',
      body.source ?? '平台',
      Number(body.budget_min) || 0, Number(body.budget_max) || 0,
      body.pref_property_type ?? '', body.pref_area ?? '',
      body.pref_rooms ?? '', Number(body.pref_min_ping) || 0,
      body.status ?? '潛在', body.notes ?? '',
      body.last_contact_at || null,
      body.next_follow_up_date || null,
      now, now,
    ]
  );

  return NextResponse.json({ buyer: dbRowToBuyer(result.rows[0] as Record<string, unknown>) }, { status: 201 });
}
