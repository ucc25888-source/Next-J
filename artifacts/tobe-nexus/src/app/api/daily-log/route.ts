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

function serverTodayPrefixes(): { full: string; short: string } {
  const d = new Date();
  return {
    full: `[${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}]`,
    short: `[${d.getMonth() + 1}/${d.getDate()}]`,
  };
}

/** Find the first line in a multi-line note that contains any of the given prefixes */
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

  // Client sends its local date prefix to avoid UTC vs local timezone mismatch
  const clientFull = req.nextUrl.searchParams.get('prefix');
  const clientShort = req.nextUrl.searchParams.get('shortPrefix');

  const { full: serverFull, short: serverShort } = serverTodayPrefixes();
  const fullPrefix = clientFull ?? serverFull;
  const shortPrefix = clientShort ?? serverShort;

  // Both LIKE patterns — match anywhere in the field (not just start)
  const fullLike  = `%${fullPrefix}%`;
  const shortLike = `%${shortPrefix}%`;

  const entries: DailyLogEntry[] = [];
  const todayPrefixes = [fullPrefix, shortPrefix];

  // ── Buyers: notes contains today's date ────────────────────────────
  const buyerRows = await query(
    `SELECT id, name, phone, notes FROM buyers
     WHERE client_id = $1 AND (notes LIKE $2 OR notes LIKE $3)`,
    [clientId, fullLike, shortLike]
  );
  for (const r of buyerRows) {
    entries.push({
      type: 'buyer',
      source_id: String(r.id),
      title: r.name as string,
      subtitle: (r.phone as string) || '',
      note: findTodayLine(r.notes as string, todayPrefixes),
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

  // ── Properties — owner_follow_up_notes contains today's date ───────
  const propertyRows = await query(
    `SELECT id, listing_id, subarea, property_type,
            address_note, owner_follow_up_notes
     FROM properties
     WHERE client_id = $1 AND (owner_follow_up_notes LIKE $2 OR owner_follow_up_notes LIKE $3)`,
    [clientId, fullLike, shortLike]
  );
  for (const r of propertyRows) {
    const propLabel = `[${r.listing_id}] ${r.subarea ?? ''} ${r.property_type ?? ''}`.trim();
    entries.push({
      type: 'property',
      source_id: String(r.id),
      title: propLabel,
      subtitle: (r.address_note as string) || '',
      note: findTodayLine(r.owner_follow_up_notes as string, todayPrefixes),
    });
  }

  return NextResponse.json({ entries, date: fullPrefix });
}
