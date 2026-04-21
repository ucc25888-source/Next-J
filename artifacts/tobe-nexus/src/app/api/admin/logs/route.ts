import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const currentMonthKey = new Date().toISOString().slice(0, 7).replace('-', '');
  const monthStart = `${currentMonthKey.slice(0, 4)}-${currentMonthKey.slice(4)}-01`;

  /* Recent logs (last 100) */
  const logs = await query(
    `SELECT id, client_id, display_name, action, property_id, tokens_used, created_at
     FROM ai_logs
     WHERE created_at >= $1::date
     ORDER BY created_at DESC
     LIMIT 100`,
    [monthStart]
  );

  /* Per-user summary for this month */
  const summary = await query(
    `SELECT client_id, display_name,
            COUNT(*)::int AS gen_count,
            SUM(tokens_used)::int AS total_tokens
     FROM ai_logs
     WHERE created_at >= $1::date
     GROUP BY client_id, display_name
     ORDER BY gen_count DESC`,
    [monthStart]
  );

  /* Total quota across all non-admin clients */
  const quotaRow = await query(
    `SELECT COALESCE(SUM(monthly_quota), 0)::int AS total_quota,
            COALESCE(SUM(CASE WHEN month_key = $1 THEN used_this_month ELSE 0 END), 0)::int AS total_used
     FROM clients
     WHERE role = 'user'`,
    [currentMonthKey]
  );

  return NextResponse.json({
    logs: logs.map((r) => ({
      id: r.id,
      client_id: r.client_id as string,
      display_name: r.display_name as string,
      action: r.action as string,
      property_id: r.property_id as string | null,
      tokens_used: r.tokens_used as number,
      created_at: r.created_at instanceof Date
        ? r.created_at.toISOString()
        : String(r.created_at),
    })),
    summary: summary.map((r) => ({
      client_id: r.client_id as string,
      display_name: r.display_name as string,
      gen_count: r.gen_count as number,
      total_tokens: r.total_tokens as number,
    })),
    quota: {
      total_quota: (quotaRow[0]?.total_quota as number) ?? 0,
      total_used: (quotaRow[0]?.total_used as number) ?? 0,
    },
  });
}
