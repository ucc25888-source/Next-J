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
    reserve_price_wan: Number(row.reserve_price_wan) ?? 0,
    build_ping: Number(row.build_ping) ?? 0,
    land_ping: Number(row.land_ping) ?? 0,
    rooms: (row.rooms as string) ?? '0',
    halls: (row.halls as string) ?? '0',
    baths: (row.baths as string) ?? '0',
    balconies: (row.balconies as string) ?? '0',
    parking: (row.parking as string) ?? '無車位',
    floor_num: (row.floor_num as string) ?? '',
    total_floors: (row.total_floors as string) ?? '',
    common_area_ratio: Number(row.common_area_ratio) ?? 0,
    face_width: (row.face_width as string) ?? '',
    road_width: (row.road_width as string) ?? '',
    depth_m: (row.depth_m as string) ?? '',
    agri_zone_type: (row.agri_zone_type as string) ?? '',
    ownership_status: (row.ownership_status as string) ?? '',
    commission_type: (row.commission_type as string) ?? '一般',
    contract_start_date: (row.contract_start_date as string) ?? '',
    contract_end_date: (row.contract_end_date as string) ?? '',
    status_now: (row.status_now as string) ?? '新進案',
    status_push: (row.status_push as string) ?? '待場勘拍照',
    alert_level: (row.alert_level as string) ?? 'green',
    negotiation_progress: (row.negotiation_progress as string) ?? '',
    main_point: (row.main_point as string) ?? '',
    second_point: (row.second_point as string) ?? '',
    target_buyer: (row.target_buyer as string) ?? '',
    must_say_3: (row.must_say_3 as string) ?? '',
    notes_private: (row.notes_private as string) ?? '',
    fb_post_count: Number(row.fb_post_count) ?? 0,
    img1_url: (row.img1_url as string) ?? '',
    img2_url: (row.img2_url as string) ?? '',
    img3_url: (row.img3_url as string) ?? '',
    img4_url: (row.img4_url as string) ?? '',
    garden_area: (row.garden_area as string) ?? '',
    owner_follow_up_date: (() => {
      const v = row.owner_follow_up_date;
      if (!v) return null;
      if (v instanceof Date) return v.toISOString().slice(0, 10);
      return String(v).slice(0, 10);
    })(),
    owner_follow_up_notes: (row.owner_follow_up_notes as string) ?? '',
    ai_note: (row.ai_note as string) ?? '',
    colisting_company: (row.colisting_company as string) ?? '',
    colisting_contact: (row.colisting_contact as string) ?? '',
    colisting_last_check: (() => {
      const v = row.colisting_last_check;
      if (!v) return null;
      if (v instanceof Date) return v.toISOString().slice(0, 10);
      return String(v).slice(0, 10);
    })(),
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
    'property_type', 'price_wan', 'reserve_price_wan', 'build_ping', 'land_ping',
    'rooms', 'halls', 'baths', 'balconies', 'parking',
    'floor_num', 'total_floors', 'common_area_ratio',
    'face_width', 'road_width', 'depth_m', 'agri_zone_type', 'ownership_status',
    'commission_type', 'contract_start_date', 'contract_end_date',
    'status_now', 'status_push', 'alert_level', 'negotiation_progress',
    'main_point', 'second_point', 'target_buyer', 'must_say_3', 'notes_private',
    'img1_url', 'img2_url', 'img3_url', 'img4_url',
    'garden_area',
    'last_generated_at', 'last_fingerprint',
    'owner_follow_up_date', 'owner_follow_up_notes',
    'ai_note',
    'colisting_company', 'colisting_contact', 'colisting_last_check',
  ];

  for (const key of allowed) {
    if (key in body) {
      const val = body[key];
      if ((key === 'contract_start_date' || key === 'contract_end_date' || key === 'owner_follow_up_date' || key === 'colisting_last_check') && val === '') {
        fields.push(`${key} = $${idx++}`);
        values.push(null);
      } else {
        fields.push(`${key} = $${idx++}`);
        values.push(val);
      }
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
