import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { queryOne, query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clientId = session.clientId as string;
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  /* ── Aggregate counts ── */
  const totals = await queryOne<{
    total: number; this_month: number;
    pending_followup: number; overdue_followup: number;
  }>(
    `SELECT
       COUNT(*)::int                                               AS total,
       COUNT(*) FILTER (WHERE showing_date >= $2)::int            AS this_month,
       COUNT(*) FILTER (WHERE follow_up_done = false
                          AND follow_up_date IS NOT NULL
                          AND follow_up_date >= CURRENT_DATE)::int AS pending_followup,
       COUNT(*) FILTER (WHERE follow_up_done = false
                          AND follow_up_date IS NOT NULL
                          AND follow_up_date < CURRENT_DATE)::int  AS overdue_followup
     FROM showings WHERE client_id = $1`,
    [clientId, monthStart]
  );

  /* ── Reaction breakdown (all time) ── */
  const reactions = await query(
    `SELECT reaction, COUNT(*)::int AS cnt
     FROM showings WHERE client_id = $1 AND reaction IS NOT NULL
     GROUP BY reaction ORDER BY cnt DESC`,
    [clientId]
  );

  /* ── Monthly trend (last 6 months) ── */
  const trend = await query(
    `SELECT TO_CHAR(showing_date, 'YYYY-MM') AS month,
            COUNT(*)::int AS cnt
     FROM showings
     WHERE client_id = $1 AND showing_date >= NOW() - INTERVAL '6 months'
     GROUP BY month ORDER BY month ASC`,
    [clientId]
  );

  /* ── Top 5 shown properties ── */
  const topProperties = await query(
    `SELECT p.subarea, p.address_note, p.listing_id,
            COUNT(s.id)::int AS shown_count,
            COUNT(*) FILTER (WHERE s.reaction = '很有興趣')::int AS hot_count
     FROM showings s
     JOIN properties p ON p.id = s.property_id
     WHERE s.client_id = $1
     GROUP BY p.id, p.subarea, p.address_note, p.listing_id
     ORDER BY shown_count DESC
     LIMIT 5`,
    [clientId]
  );

  return NextResponse.json({
    totals: {
      total: totals?.total ?? 0,
      this_month: totals?.this_month ?? 0,
      pending_followup: totals?.pending_followup ?? 0,
      overdue_followup: totals?.overdue_followup ?? 0,
    },
    reactions: reactions.map((r) => ({
      reaction: r.reaction as string,
      cnt: r.cnt as number,
    })),
    trend: trend.map((r) => ({
      month: r.month as string,
      cnt: r.cnt as number,
    })),
    topProperties: topProperties.map((r) => ({
      subarea: r.subarea as string,
      address_note: r.address_note as string,
      listing_id: r.listing_id as string,
      shown_count: r.shown_count as number,
      hot_count: r.hot_count as number,
    })),
  });
}
