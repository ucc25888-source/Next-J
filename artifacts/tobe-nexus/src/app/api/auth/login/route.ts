import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { queryOne } from '@/lib/db';
import type { Client } from '@/types';

interface DbClient {
  client_id: string;
  display_name: string;
  login_token: string;
  plan_name: string;
  monthly_quota: number;
  used_this_month: number;
  month_key: string;
  status: string;
  created_at: string;
  role: string;
  has_line_service: boolean;
  line_notify_token: string | null;
}

function resetMonthIfNeeded(row: DbClient): DbClient {
  const currentMonthKey = new Date().toISOString().slice(0, 7).replace('-', '');
  if (row.month_key !== currentMonthKey) {
    return { ...row, used_this_month: 0, month_key: currentMonthKey };
  }
  return row;
}

export async function POST(req: NextRequest) {
  const { client_id, login_token } = (await req.json()) as {
    client_id: string;
    login_token: string;
  };

  if (!client_id || !login_token) {
    return NextResponse.json({ error: '請填寫客戶代碼和存取碼' }, { status: 400 });
  }

  const row = await queryOne<DbClient>(
    'SELECT * FROM clients WHERE client_id = $1 AND login_token = $2',
    [client_id.toUpperCase().trim(), login_token.trim()]
  );

  if (!row) {
    return NextResponse.json({ error: '客戶代碼或存取碼不正確' }, { status: 401 });
  }

  if (row.status !== 'active' && row.role !== 'admin') {
    return NextResponse.json({ error: '帳號已停用，請聯繫業務窗口' }, { status: 403 });
  }

  const client = resetMonthIfNeeded(row);

  const session = await getSession();
  session.clientId = client.client_id;
  session.displayName = client.display_name;
  session.isAdmin = client.role === 'admin';
  await session.save();

  const payload: Client = {
    client_id: client.client_id,
    display_name: client.display_name,
    login_token: '',
    plan_name: client.plan_name,
    monthly_quota: client.monthly_quota,
    used_this_month: client.used_this_month,
    month_key: client.month_key,
    status: client.status,
    created_at: client.created_at,
    has_line_service: client.has_line_service ?? false,
    line_notify_token: client.line_notify_token ?? undefined,
  };

  return NextResponse.json({ client: payload, isAdmin: session.isAdmin });
}
