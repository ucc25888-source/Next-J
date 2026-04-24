import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { queryOne, query } from '@/lib/db';

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.clientId) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const { current_password, new_password } = (await req.json()) as {
    current_password: string;
    new_password: string;
  };

  if (!current_password || !new_password) {
    return NextResponse.json({ error: '請填寫所有欄位' }, { status: 400 });
  }

  if (new_password.length < 6) {
    return NextResponse.json({ error: '新存取碼至少需要 6 個字元' }, { status: 400 });
  }

  const row = await queryOne(
    'SELECT client_id FROM clients WHERE client_id = $1 AND login_token = $2',
    [session.clientId, current_password]
  );

  if (!row) {
    return NextResponse.json({ error: '目前存取碼不正確' }, { status: 400 });
  }

  await query(
    'UPDATE clients SET login_token = $1 WHERE client_id = $2',
    [new_password, session.clientId]
  );

  return NextResponse.json({ ok: true });
}
