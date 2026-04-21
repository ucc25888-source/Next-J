import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import type { DailyFocusItem } from '@/types';

export async function GET() {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clientId = session.clientId;
  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const items: DailyFocusItem[] = [];

  /* ── 1. Buyers with next_follow_up_date ≤ today ── */
  const buyerRows = await query(
    `SELECT id, name, phone, status, next_follow_up_date
     FROM buyers
     WHERE client_id = $1
       AND next_follow_up_date IS NOT NULL
       AND next_follow_up_date <= $2
     ORDER BY next_follow_up_date ASC`,
    [clientId, todayStr]
  );

  for (const r of buyerRows) {
    const date = (r.next_follow_up_date as string).slice(0, 10);
    items.push({
      id: `buyer-${r.id as string}`,
      type: 'buyer',
      source_id: r.id as string,
      title: r.name as string,
      subtitle: `狀態：${r.status as string}${r.phone ? ` · ${r.phone as string}` : ''}`,
      date,
      is_overdue: date < todayStr,
      done: false,
    });
  }

  /* ── 2. Showings follow-up ≤ today, not done ── */
  const showingRows = await query(
    `SELECT s.id, s.buyer_name, s.buyer_phone, s.reaction, s.follow_up_date, s.follow_up,
            p.subarea, p.property_type, p.listing_id
     FROM showings s
     LEFT JOIN properties p ON p.id = s.property_id
     WHERE s.client_id = $1
       AND s.follow_up_date IS NOT NULL
       AND s.follow_up_date <= $2
       AND s.follow_up_done = FALSE
     ORDER BY s.follow_up_date ASC`,
    [clientId, todayStr]
  );

  for (const r of showingRows) {
    const date = (r.follow_up_date as string).slice(0, 10);
    const propLabel = r.listing_id
      ? `[${r.listing_id as string}] ${r.subarea as string} ${r.property_type as string}`
      : r.subarea ? `${r.subarea as string} ${r.property_type as string}` : null;

    items.push({
      id: `showing-${r.id as string}`,
      type: 'showing',
      source_id: r.id as string,
      title: `帶看回訪：${r.buyer_name as string}`,
      subtitle: [
        r.reaction as string,
        propLabel,
        r.follow_up as string || null,
      ].filter(Boolean).join(' · '),
      date,
      is_overdue: date < todayStr,
      done: false,
    });
  }

  /* ── 3. Properties contract expiring within 7 days ── */
  const propRows = await query(
    `SELECT id, listing_id, subarea, property_type, contract_end_date, status_now
     FROM properties
     WHERE client_id = $1
       AND contract_end_date IS NOT NULL
       AND contract_end_date != ''
       AND contract_end_date <= $2
       AND contract_end_date >= $3
     ORDER BY contract_end_date ASC`,
    [clientId, sevenDaysLater, todayStr]
  );

  for (const r of propRows) {
    const date = (r.contract_end_date as string).slice(0, 10);
    const daysLeft = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    items.push({
      id: `property-${r.id as string}`,
      type: 'property',
      source_id: r.id as string,
      title: `委託到期：${r.listing_id ? `[${r.listing_id as string}] ` : ''}${r.subarea as string} ${r.property_type as string}`,
      subtitle: `${daysLeft <= 0 ? '已到期' : `${daysLeft} 天後到期`} · 狀態：${r.status_now as string}`,
      date,
      is_overdue: date < todayStr,
      done: false,
    });
  }

  /* Sort: overdue first, then by date */
  items.sort((a, b) => {
    if (a.is_overdue && !b.is_overdue) return -1;
    if (!a.is_overdue && b.is_overdue) return 1;
    return a.date.localeCompare(b.date);
  });

  return NextResponse.json({ items, today: todayStr });
}
