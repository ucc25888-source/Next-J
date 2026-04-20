import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query, queryOne } from '@/lib/db';
import type { Property } from '@/types';

function dbRowToProperty(row: Record<string, unknown>): Property {
  return {
    id: row.id as string,
    client_id: row.client_id as string,
    listing_type: row.listing_type as 'C' | 'B',
    listing_id: (row.listing_id as string) ?? '',
    area_code: (row.area_code as string) ?? '',
    subarea: (row.subarea as string) ?? '',
    address_note: (row.address_note as string) ?? '',
    property_type: (row.property_type as string) ?? '',
    price_wan: Number(row.price_wan) ?? 0,
    build_ping: Number(row.build_ping) ?? 0,
    land_ping: Number(row.land_ping) ?? 0,
    rooms: (row.rooms as string) ?? '0',
    halls: (row.halls as string) ?? '0',
    baths: (row.baths as string) ?? '0',
    balconies: (row.balconies as string) ?? '0',
    parking: (row.parking as string) ?? '無車位',
    status_now: (row.status_now as string) ?? '新進案',
    status_push: (row.status_push as string) ?? '待場勘拍照',
    main_point: (row.main_point as string) ?? '',
    second_point: (row.second_point as string) ?? '',
    target_buyer: (row.target_buyer as string) ?? '',
    must_say_3: (row.must_say_3 as string) ?? '',
    notes_private: (row.notes_private as string) ?? '',
    img1_url: (row.img1_url as string) ?? '',
    img2_url: (row.img2_url as string) ?? '',
    img3_url: (row.img3_url as string) ?? '',
    img4_url: (row.img4_url as string) ?? '',
    last_generated_at: row.last_generated_at as string | undefined,
    last_fingerprint: row.last_fingerprint as string | undefined,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    updated_at: (row.updated_at as string) ?? new Date().toISOString(),
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const row = await queryOne(
    'SELECT * FROM properties WHERE id = $1 AND client_id = $2',
    [id, session.clientId]
  );

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ property: dbRowToProperty(row as Record<string, unknown>) });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as Partial<Property>;
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed: (keyof Property)[] = [
    'listing_type', 'listing_id', 'area_code', 'subarea', 'address_note',
    'property_type', 'price_wan', 'build_ping', 'land_ping', 'rooms', 'halls',
    'baths', 'balconies', 'parking', 'status_now', 'status_push', 'main_point',
    'second_point', 'target_buyer', 'must_say_3', 'notes_private',
    'img1_url', 'img2_url', 'img3_url', 'img4_url',
    'last_generated_at', 'last_fingerprint',
  ];

  for (const key of allowed) {
    if (key in body) {
      fields.push(`${key} = $${idx++}`);
      values.push(body[key]);
    }
  }

  fields.push(`updated_at = $${idx++}`);
  values.push(now);
  values.push(id);
  values.push(session.clientId);

  await query(
    `UPDATE properties SET ${fields.join(', ')} WHERE id = $${idx++} AND client_id = $${idx}`,
    values
  );

  const row = await queryOne('SELECT * FROM properties WHERE id = $1', [id]);
  return NextResponse.json({ property: dbRowToProperty(row as Record<string, unknown>) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await query('DELETE FROM properties WHERE id = $1 AND client_id = $2', [id, session.clientId]);
  return NextResponse.json({ ok: true });
}
