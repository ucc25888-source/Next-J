import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { queryOne } from '@/lib/db';
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Partial<Buyer>;
  const now = new Date().toISOString();

  const row = await queryOne(
    `UPDATE buyers SET
      name=$1, phone=$2, email=$3, line_id=$4, source=$5,
      budget_min=$6, budget_max=$7, pref_property_type=$8, pref_area=$9,
      pref_rooms=$10, pref_min_ping=$11, status=$12, notes=$13,
      last_contact_at=$14, updated_at=$15
    WHERE id=$16 AND client_id=$17 RETURNING *`,
    [
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
      now,
      id,
      session.clientId,
    ]
  );

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
  await queryOne('DELETE FROM buyers WHERE id = $1 AND client_id = $2', [id, session.clientId]);

  return NextResponse.json({ ok: true });
}
