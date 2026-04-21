import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const currentMonthKey = new Date().toISOString().slice(0, 7).replace('-', '');

  const rows = await query(`
    SELECT
      c.client_id,
      c.display_name,
      c.plan_name,
      c.monthly_quota,
      CASE WHEN c.month_key = $1 THEN c.used_this_month ELSE 0 END AS used_this_month,
      c.month_key,
      c.status,
      c.created_at,
      c.has_line_service,
      c.line_notify_token,
      COUNT(DISTINCT p.id)::int AS property_count,
      COUNT(DISTINCT cp.copy_id)::int AS total_copies
    FROM clients c
    LEFT JOIN properties p ON p.client_id = c.client_id
    LEFT JOIN copies cp ON cp.client_id = c.client_id
    WHERE c.role = 'user'
    GROUP BY c.client_id
    ORDER BY c.created_at ASC
  `, [currentMonthKey]);

  return NextResponse.json({ clients: rows });
}
