import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const currentMonthKey = new Date().toISOString().slice(0, 7).replace('-', '');

  const [clients, propCounts, copyCounts, propLatest] = await Promise.all([
    query<{
      client_id: string; display_name: string; plan_name: string; monthly_quota: number;
      used_this_month: number; month_key: string; status: string; created_at: string;
      has_line_service: boolean; line_notify_token: string | null;
    }>(`SELECT client_id, display_name, plan_name, monthly_quota, used_this_month, month_key, status, created_at, has_line_service, line_notify_token FROM clients WHERE role = 'user' ORDER BY created_at ASC`),
    query<{ client_id: string; cnt: number }>(`SELECT client_id, COUNT(*)::int AS cnt FROM properties GROUP BY client_id`),
    query<{ client_id: string; cnt: number }>(`SELECT client_id, COUNT(*)::int AS cnt FROM copies GROUP BY client_id`),
    query<{ client_id: string; latest_keyin: string }>(`SELECT client_id, MAX(created_at) AS latest_keyin FROM properties GROUP BY client_id`),
  ]);

  const propMap   = Object.fromEntries(propCounts.map(r => [r.client_id, r.cnt]));
  const copyMap   = Object.fromEntries(copyCounts.map(r => [r.client_id, r.cnt]));
  const keyinMap  = Object.fromEntries(propLatest.map(r => [r.client_id, r.latest_keyin]));

  const result = clients.map(c => ({
    ...c,
    used_this_month: c.month_key === currentMonthKey ? c.used_this_month : 0,
    property_count: propMap[c.client_id] ?? 0,
    total_copies: copyMap[c.client_id] ?? 0,
    latest_prop_keyin: keyinMap[c.client_id] ?? null,
  }));

  return NextResponse.json({ clients: result });
}
