import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { queryOne } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = (await req.json()) as {
    monthly_quota?: number;
    status?: string;
    display_name?: string;
    plan_name?: string;
    reset_usage?: boolean;
    has_line_service?: boolean;
    line_notify_token?: string | null;
  };

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (body.monthly_quota !== undefined) {
    updates.push(`monthly_quota = $${idx++}`);
    values.push(body.monthly_quota);
  }
  if (body.status !== undefined) {
    updates.push(`status = $${idx++}`);
    values.push(body.status);
  }
  if (body.display_name !== undefined) {
    updates.push(`display_name = $${idx++}`);
    values.push(body.display_name);
  }
  if (body.plan_name !== undefined) {
    updates.push(`plan_name = $${idx++}`);
    values.push(body.plan_name);
  }
  if (body.reset_usage) {
    updates.push(`used_this_month = 0`);
  }
  if (body.has_line_service !== undefined) {
    updates.push(`has_line_service = $${idx++}`);
    values.push(body.has_line_service);
  }
  if (body.line_notify_token !== undefined) {
    updates.push(`line_notify_token = $${idx++}`);
    values.push(body.line_notify_token);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(id);
  const row = await queryOne(
    `UPDATE clients SET ${updates.join(', ')} WHERE client_id = $${idx} RETURNING *`,
    values
  );

  return NextResponse.json({ client: row });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await queryOne('DELETE FROM clients WHERE client_id = $1 AND client_id != $2', [id, 'ADMIN']);
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json()) as {
    client_id: string;
    display_name: string;
    login_token: string;
    plan_name?: string;
    monthly_quota?: number;
  };

  const row = await queryOne(
    `INSERT INTO clients (client_id, display_name, login_token, plan_name, monthly_quota, status)
     VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
    [
      body.client_id.toUpperCase(),
      body.display_name,
      body.login_token,
      body.plan_name ?? 'basic',
      body.monthly_quota ?? 30,
    ]
  );

  return NextResponse.json({ client: row }, { status: 201 });
}
