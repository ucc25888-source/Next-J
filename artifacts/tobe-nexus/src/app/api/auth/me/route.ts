import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { queryOne } from '@/lib/db';

interface DbClient {
  client_id: string;
  display_name: string;
  plan_name: string;
  monthly_quota: number;
  used_this_month: number;
  month_key: string;
  status: string;
  created_at: string;
  has_line_service: boolean;
  line_notify_token: string | null;
}

export async function GET() {
  const session = await getSession();
  if (!session.clientId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentMonthKey = new Date().toISOString().slice(0, 7).replace('-', '');

  const row = await queryOne<DbClient>(
    'SELECT client_id, display_name, plan_name, monthly_quota, used_this_month, month_key, status, created_at, has_line_service, line_notify_token FROM clients WHERE client_id = $1',
    [session.clientId]
  );

  if (!row) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const used = row.month_key !== currentMonthKey ? 0 : row.used_this_month;

  return NextResponse.json({
    client: {
      client_id: row.client_id,
      display_name: row.display_name,
      login_token: '',
      plan_name: row.plan_name,
      monthly_quota: row.monthly_quota,
      used_this_month: used,
      month_key: row.month_key,
      status: row.status,
      created_at: row.created_at,
      has_line_service: row.has_line_service ?? false,
      line_notify_token: row.line_notify_token ?? undefined,
    },
    isAdmin: session.isAdmin ?? false,
  });
}
