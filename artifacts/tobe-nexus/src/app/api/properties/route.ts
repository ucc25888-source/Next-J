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

export async function GET() {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await query(
    'SELECT * FROM properties WHERE client_id = $1 ORDER BY created_at DESC',
    [session.clientId]
  );

  return NextResponse.json({ properties: rows.map(dbRowToProperty) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as Partial<Property>;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await queryOne(
    `INSERT INTO properties (
      id, client_id, listing_type, listing_id, area_code, subarea, address_note,
      property_type, price_wan, reserve_price_wan, build_ping, land_ping,
      rooms, halls, baths, balconies, parking,
      floor_num, total_floors, common_area_ratio,
      face_width, road_width, depth_m, agri_zone_type, ownership_status,
      commission_type, contract_start_date, contract_end_date,
      status_now, status_push, alert_level, negotiation_progress,
      main_point, second_point, target_buyer, must_say_3, notes_private,
      fb_post_count, img1_url, img2_url, img3_url, img4_url,
      garden_area,
      owner_follow_up_date, owner_follow_up_notes,
      colisting_company, colisting_contact, colisting_last_check,
      created_at, updated_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
      $18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,
      $33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50
    ) RETURNING *`,
    [
      id, session.clientId, body.listing_type ?? 'C', body.listing_id ?? '',
      body.area_code ?? '', body.subarea ?? '', body.address_note ?? '',
      body.property_type ?? '', body.price_wan ?? 0, body.reserve_price_wan ?? 0,
      body.build_ping ?? 0, body.land_ping ?? 0,
      body.rooms ?? '0', body.halls ?? '0', body.baths ?? '0',
      body.balconies ?? '0', body.parking ?? '無車位',
      body.floor_num ?? '', body.total_floors ?? '', body.common_area_ratio ?? 0,
      body.face_width ?? '', body.road_width ?? '', body.depth_m ?? '',
      body.agri_zone_type ?? '', body.ownership_status ?? '',
      body.commission_type ?? '一般',
      body.contract_start_date || null,
      body.contract_end_date || null,
      body.status_now ?? '新進案', body.status_push ?? '待場勘拍照',
      body.alert_level ?? 'green', body.negotiation_progress ?? '',
      body.main_point ?? '', body.second_point ?? '',
      body.target_buyer ?? '', body.must_say_3 ?? '', body.notes_private ?? '',
      0,
      body.img1_url ?? '', body.img2_url ?? '', body.img3_url ?? '', body.img4_url ?? '',
      body.garden_area ?? '',
      body.owner_follow_up_date || null,
      body.owner_follow_up_notes ?? '',
      body.colisting_company ?? '',
      body.colisting_contact ?? '',
      body.colisting_last_check || null,
      now, now,
    ]
  );

  const row = await queryOne('SELECT * FROM properties WHERE id = $1', [id]);
  return NextResponse.json({ property: dbRowToProperty(row as Record<string, unknown>) }, { status: 201 });
}
