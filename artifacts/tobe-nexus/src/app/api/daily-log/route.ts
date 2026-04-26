import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface DailyLogEntry {
  type: 'buyer' | 'showing' | 'colisting' | 'property';
  source_id: string;
  title: string;
  subtitle: string;
  note: string;
}

export interface TodayNewEntry {
  type: 'buyer' | 'showing' | 'property';
  source_id: string;
  title: string;
  subtitle: string;
}

function serverTodayPrefixes(): { full: string; short: string } {
  const d = new Date();
  return {
    full: `[${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}]`,
    short: `[${d.getMonth() + 1}/${d.getDate()}]`,
  };
}

function findTodayLine(text: string, prefixes: string[]): string {
  const lines = text.split('\n');
  for (const line of lines) {
    if (prefixes.some(p => line.includes(p))) return line.trim();
  }
  return lines[0]?.trim() ?? '';
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clientId = session.clientId;

  const clientFull = req.nextUrl.searchParams.get('prefix');
  const clientShort = req.nextUrl.searchParams.get('shortPrefix');

  const { full: serverFull, short: serverShort } = serverTodayPrefixes();
  const fullPrefix = clientFull ?? serverFull;
  const shortPrefix = clientShort ?? serverShort;

  const fullLike  = `%${fullPrefix}%`;
  const shortLike = `%${shortPrefix}%`;

  const entries: DailyLogEntry[] = [];
  const todayPrefixes = [fullPrefix, shortPrefix];

  // ── Buyers: visit_log contains today's date ────────────────────────
  const buyerRows = await query(
    `SELECT id, name, phone, visit_log FROM buyers
     WHERE client_id = $1 AND (visit_log LIKE $2 OR visit_log LIKE $3)`,
    [clientId, fullLike, shortLike]
  );
  for (const r of buyerRows) {
    entries.push({
      type: 'buyer',
      source_id: String(r.id),
      title: r.name as string,
      subtitle: (r.phone as string) || '',
      note: findTodayLine(r.visit_log as string, todayPrefixes),
    });
  }

  // ── Showings: follow_up contains today's date ───────────────────────
  const showingRows = await query(
    `SELECT s.id, b.name AS buyer_name, b.phone AS buyer_phone,
            p.listing_id, p.subarea, p.property_type, s.follow_up
     FROM showings s
     LEFT JOIN buyers b ON b.id = s.buyer_id
     LEFT JOIN properties p ON p.id = s.property_id
     WHERE s.client_id = $1 AND (s.follow_up LIKE $2 OR s.follow_up LIKE $3)`,
    [clientId, fullLike, shortLike]
  );
  for (const r of showingRows) {
    const propLabel = r.listing_id
      ? `[${r.listing_id}] ${r.subarea ?? ''} ${r.property_type ?? ''}`.trim()
      : '未指定物件';
    entries.push({
      type: 'showing',
      source_id: String(r.id),
      title: `${r.buyer_name ?? '買方'} · ${propLabel}`,
      subtitle: (r.buyer_phone as string) || '',
      note: findTodayLine(r.follow_up as string, todayPrefixes),
    });
  }

  // ── Properties — colisting_notes contains today's date ─────────────
  const colistingRows = await query(
    `SELECT id, listing_id, subarea, property_type,
            colisting_company, colisting_contact, colisting_notes
     FROM properties
     WHERE client_id = $1 AND (colisting_notes LIKE $2 OR colisting_notes LIKE $3)`,
    [clientId, fullLike, shortLike]
  );
  for (const r of colistingRows) {
    const propLabel = `[${r.listing_id}] ${r.subarea ?? ''} ${r.property_type ?? ''}`.trim();
    entries.push({
      type: 'colisting',
      source_id: String(r.id),
      title: propLabel,
      subtitle: `${r.colisting_company ?? ''}${r.colisting_contact ? ` · ${r.colisting_contact}` : ''}`,
      note: findTodayLine(r.colisting_notes as string, todayPrefixes),
    });
  }

  // ── Properties — push_log contains today's date ─────────────────
  const propertyRows = await query(
    `SELECT id, listing_id, subarea, property_type,
            address_note, push_log
     FROM properties
     WHERE client_id = $1 AND (push_log LIKE $2 OR push_log LIKE $3)`,
    [clientId, fullLike, shortLike]
  );
  for (const r of propertyRows) {
    const propLabel = `[${r.listing_id}] ${r.subarea ?? ''} ${r.property_type ?? ''}`.trim();
    entries.push({
      type: 'property',
      source_id: String(r.id),
      title: propLabel,
      subtitle: (r.address_note as string) || '',
      note: findTodayLine(r.push_log as string, todayPrefixes),
    });
  }

  // ── TODAY'S NEW ENTRIES: records created today (Taiwan time UTC+8) ──
  const newEntries: TodayNewEntry[] = [];

  try {
    // ── UTC range for Taiwan today ────────────────────────────────────
    // Taiwan is UTC+8. Taiwan midnight = UTC (today − 8h).
    // e.g. 2026-04-26 Taiwan = 2026-04-25T16:00:00Z → 2026-04-26T16:00:00Z
    const taiwanNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const [yr, mo, dy] = [taiwanNow.getUTCFullYear(), taiwanNow.getUTCMonth(), taiwanNow.getUTCDate()];
    const startUTC = new Date(Date.UTC(yr, mo, dy) - 8 * 3600 * 1000).toISOString();
    const endUTC   = new Date(Date.UTC(yr, mo, dy) - 8 * 3600 * 1000 + 86400000).toISOString();

    const newProperties = await query(
      `SELECT id, listing_id, subarea, property_type, address_note, price_wan
       FROM properties
       WHERE client_id = $1
         AND created_at >= $2
         AND created_at <  $3
       ORDER BY created_at DESC`,
      [clientId, startUTC, endUTC]
    );
    for (const r of newProperties) {
      const propLabel = r.listing_id
        ? `[${r.listing_id}] ${r.subarea ?? ''} ${r.property_type ?? ''}`.trim()
        : `${r.subarea ?? ''} ${r.property_type ?? ''}`.trim() || '新案件';
      newEntries.push({
        type: 'property',
        source_id: String(r.id),
        title: propLabel,
        subtitle: [
          r.address_note || '',
          r.price_wan ? `${r.price_wan}萬` : '',
        ].filter(Boolean).join(' · '),
      });
    }

    const newBuyers = await query(
      `SELECT id, name, phone, status
       FROM buyers
       WHERE client_id = $1
         AND created_at >= $2
         AND created_at <  $3
       ORDER BY created_at DESC`,
      [clientId, startUTC, endUTC]
    );
    for (const r of newBuyers) {
      newEntries.push({
        type: 'buyer',
        source_id: String(r.id),
        title: r.name as string,
        subtitle: [r.phone || '', r.status || ''].filter(Boolean).join(' · '),
      });
    }

    const newShowings = await query(
      `SELECT s.id, s.buyer_name, p.listing_id, p.subarea, p.property_type
       FROM showings s
       LEFT JOIN properties p ON p.id = s.property_id
       WHERE s.client_id = $1
         AND s.created_at >= $2
         AND s.created_at <  $3
       ORDER BY s.created_at DESC`,
      [clientId, startUTC, endUTC]
    );
    for (const r of newShowings) {
      const propLabel = r.listing_id
        ? `[${r.listing_id}] ${r.subarea ?? ''} ${r.property_type ?? ''}`.trim()
        : '未指定物件';
      newEntries.push({
        type: 'showing',
        source_id: String(r.id),
        title: `帶看：${r.buyer_name ?? '買方'}`,
        subtitle: propLabel,
      });
    }
  } catch (err) {
    console.error('[daily-log] newEntries query failed:', err);
  }

  return NextResponse.json({ entries, newEntries, date: fullPrefix });
}
