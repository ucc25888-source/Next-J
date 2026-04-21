/**
 * getDailyTasks — core daily-focus data source
 *
 * This is the single source of truth for all daily-focus items.
 * Used by:
 *   - /api/daily-focus   (webapp)
 *   - /api/line-tasks    (future LINE Messaging API integration)
 *
 * To connect LINE in the future:
 *   1. Call getDailyTasks(clientId) inside /api/line-tasks/route.ts
 *   2. Format the returned items into LINE flex-message bubbles
 *   3. POST to LINE Messaging API push endpoint with your channel access token
 */

import { query } from '@/lib/db';
import type { DailyFocusItem } from '@/types';

export async function getDailyTasks(clientId: string): Promise<{
  items: DailyFocusItem[];
  today: string;
  summary: {
    overdue: number;
    todayCount: number;
    propertyAlerts: number;
    done: number;
    total: number;
  };
}> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const twentyOneDaysAgo = new Date(Date.now() - 21 * 86400000).toISOString().slice(0, 10);

  const items: DailyFocusItem[] = [];

  /* ── 1. Buyers: next_follow_up_date <= today, status not done ── */
  const buyerRows = await query(
    `SELECT id, name, phone, status, next_follow_up_date
     FROM buyers
     WHERE client_id = $1
       AND next_follow_up_date IS NOT NULL
       AND next_follow_up_date <= $2
       AND status NOT IN ('已成交', '放棄')
     ORDER BY next_follow_up_date ASC`,
    [clientId, todayStr]
  );

  for (const r of buyerRows) {
    const raw = r.next_follow_up_date as string | Date;
    const date = (raw instanceof Date ? raw.toISOString() : String(raw)).slice(0, 10);
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

  /* ── 2. Showings: follow_up_date <= today, not marked done ── */
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
    const rawDate = r.follow_up_date as string | Date;
    const date = (rawDate instanceof Date ? rawDate.toISOString() : String(rawDate)).slice(0, 10);
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

  /* ── 3. Properties: contract expiring within 7 days ── */
  const allPropRows = await query(
    `SELECT id, listing_id, subarea, property_type, contract_end_date, status_now
     FROM properties
     WHERE client_id = $1
       AND contract_end_date IS NOT NULL
     ORDER BY contract_end_date ASC`,
    [clientId]
  );

  for (const r of allPropRows) {
    const rawCED = r.contract_end_date as string | Date;
    const date = (rawCED instanceof Date ? rawCED.toISOString() : String(rawCED)).slice(0, 10);
    if (date < todayStr || date > sevenDaysLater) continue;
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

  /* ── 4. 同業聯賣: check-in overdue (every 21 days) ── */
  const colistingRows = await query(
    `SELECT id, listing_id, subarea, property_type, colisting_company, colisting_contact, colisting_last_check
     FROM properties
     WHERE client_id = $1
       AND commission_type = '同業聯賣'
       AND (colisting_last_check IS NULL OR colisting_last_check <= $2)
     ORDER BY colisting_last_check ASC NULLS FIRST`,
    [clientId, twentyOneDaysAgo]
  );

  for (const r of colistingRows) {
    const rawCheck = r.colisting_last_check as string | Date | null;
    const lastCheck = rawCheck
      ? (rawCheck instanceof Date ? rawCheck.toISOString() : String(rawCheck)).slice(0, 10)
      : null;
    const daysSince = lastCheck
      ? Math.floor((Date.now() - new Date(lastCheck).getTime()) / 86400000)
      : null;
    const propLabel = r.listing_id
      ? `[${r.listing_id as string}] ${r.subarea as string} ${r.property_type as string}`
      : `${r.subarea as string} ${r.property_type as string}`;

    items.push({
      id: `colisting-${r.id as string}`,
      type: 'colisting',
      source_id: r.id as string,
      title: `同業聯賣詢問：${propLabel}`,
      subtitle: [
        r.colisting_company ? `${r.colisting_company as string}` : null,
        r.colisting_contact ? `窗口：${r.colisting_contact as string}` : null,
        daysSince !== null ? `上次詢問 ${daysSince} 天前` : '尚未詢問過',
      ].filter(Boolean).join(' · '),
      date: todayStr,
      is_overdue: lastCheck === null,
      done: false,
    });
  }

  /* Sort: overdue first, then by date ascending */
  items.sort((a, b) => {
    if (a.is_overdue && !b.is_overdue) return -1;
    if (!a.is_overdue && b.is_overdue) return 1;
    return a.date.localeCompare(b.date);
  });

  const overdue        = items.filter((i) => i.is_overdue && i.type !== 'property').length;
  const todayCount     = items.filter((i) => !i.is_overdue && i.type !== 'property').length;
  const propertyAlerts = items.filter((i) => i.type === 'property').length;

  return {
    items,
    today: todayStr,
    summary: {
      overdue,
      todayCount,
      propertyAlerts,
      done: 0,
      total: overdue + todayCount + propertyAlerts,
    },
  };
}
