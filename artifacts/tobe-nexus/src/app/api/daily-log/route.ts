import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface DailyLogEntry {
  type: 'buyer' | 'showing' | 'colisting' | 'property';
  source_id: number;
  title: string;
  subtitle: string;
  note: string;
}

function todayPrefix() {
  const d = new Date();
  return `[${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}]`;
}

export async function GET() {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clientId = session.clientId;
  const prefix = todayPrefix();
  const likePattern = `${prefix}%`;

  const entries: DailyLogEntry[] = [];

  // ── Buyers: notes starts with today's prefix ───────────────────────
  const buyerRows = await query(
    `SELECT id, name, phone, notes FROM buyers
     WHERE client_id = $1 AND notes LIKE $2`,
    [clientId, likePattern]
  );
  for (const r of buyerRows) {
    const firstLine = (r.notes as string).split('\n')[0];
    entries.push({
      type: 'buyer',
      source_id: r.id as number,
      title: r.name as string,
      subtitle: (r.phone as string) || '',
      note: firstLine,
    });
  }

  // ── Showings: follow_up starts with today's prefix ─────────────────
  const showingRows = await query(
    `SELECT s.id, b.name AS buyer_name, b.phone AS buyer_phone,
            p.listing_id, p.subarea, p.property_type, s.follow_up
     FROM showings s
     LEFT JOIN buyers b ON b.id = s.buyer_id
     LEFT JOIN properties p ON p.id = s.property_id
     WHERE s.client_id = $1 AND s.follow_up LIKE $2`,
    [clientId, likePattern]
  );
  for (const r of showingRows) {
    const propLabel = r.listing_id
      ? `[${r.listing_id}] ${r.subarea ?? ''} ${r.property_type ?? ''}`.trim()
      : '未指定物件';
    const firstLine = (r.follow_up as string).split('\n')[0];
    entries.push({
      type: 'showing',
      source_id: r.id as number,
      title: `${r.buyer_name ?? '買方'} · ${propLabel}`,
      subtitle: (r.buyer_phone as string) || '',
      note: firstLine,
    });
  }

  // ── Properties — colisting_notes starts with today's prefix ────────
  const colistingRows = await query(
    `SELECT id, listing_id, subarea, property_type,
            colisting_company, colisting_contact, colisting_notes
     FROM properties
     WHERE client_id = $1 AND colisting_notes LIKE $2`,
    [clientId, likePattern]
  );
  for (const r of colistingRows) {
    const propLabel = `[${r.listing_id}] ${r.subarea ?? ''} ${r.property_type ?? ''}`.trim();
    const firstLine = (r.colisting_notes as string).split('\n')[0];
    entries.push({
      type: 'colisting',
      source_id: r.id as number,
      title: propLabel,
      subtitle: `${r.colisting_company ?? ''}${r.colisting_contact ? ` · ${r.colisting_contact}` : ''}`,
      note: firstLine,
    });
  }

  // ── Properties — owner_follow_up_notes starts with today's prefix ──
  const propertyRows = await query(
    `SELECT id, listing_id, subarea, property_type,
            address_note, owner_follow_up_notes
     FROM properties
     WHERE client_id = $1 AND owner_follow_up_notes LIKE $2`,
    [clientId, likePattern]
  );
  for (const r of propertyRows) {
    const propLabel = `[${r.listing_id}] ${r.subarea ?? ''} ${r.property_type ?? ''}`.trim();
    const firstLine = (r.owner_follow_up_notes as string).split('\n')[0];
    entries.push({
      type: 'property',
      source_id: r.id as number,
      title: propLabel,
      subtitle: (r.address_note as string) || '',
      note: firstLine,
    });
  }

  return NextResponse.json({ entries, date: prefix });
}
