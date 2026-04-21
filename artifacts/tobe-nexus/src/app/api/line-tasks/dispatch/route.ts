/**
 * /api/line-tasks/dispatch  (POST)
 *
 * Personalized batch dispatcher — runs every day at 10:00 & 16:00 via cron.
 * Loops every client that has `has_line_service = true` and a valid
 * `line_notify_token`, fetches their daily tasks, and pushes to LINE Notify.
 *
 * Auth: requires either
 *   - Admin session   (isAdmin = true), OR
 *   - Header  X-Cron-Secret: <CRON_SECRET env var>
 *
 * Response: { dispatched: number, skipped: number, results: DispatchResult[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { getDailyTasks } from '@/lib/getDailyTasks';

export const dynamic = 'force-dynamic';

interface LineClient {
  client_id: string;
  display_name: string;
  line_notify_token: string;
}

interface DispatchResult {
  client_id: string;
  display_name: string;
  status: 'sent' | 'skipped' | 'error';
  task_count?: number;
  error?: string;
}

function buildMessage(displayName: string, items: Awaited<ReturnType<typeof getDailyTasks>>['items'], today: string, summary: Awaited<ReturnType<typeof getDailyTasks>>['summary']): string {
  const lines: string[] = [
    `📋 ${displayName}｜每日重點 ${today}`,
    `共 ${summary.total} 項任務`,
    '',
  ];

  const overdue = items.filter((i) => i.is_overdue && i.type !== 'property');
  const todayArr = items.filter((i) => !i.is_overdue && i.type !== 'property');
  const props = items.filter((i) => i.type === 'property');

  if (overdue.length > 0) {
    lines.push(`🔴 逾期未處理（${overdue.length}）`);
    overdue.forEach((i) => lines.push(`  • ${i.title} — ${i.subtitle ?? ''}`));
    lines.push('');
  }
  if (todayArr.length > 0) {
    lines.push(`🔵 今日任務（${todayArr.length}）`);
    todayArr.forEach((i) => lines.push(`  • ${i.title} — ${i.subtitle ?? ''}`));
    lines.push('');
  }
  if (props.length > 0) {
    lines.push(`🟡 委託到期提醒（${props.length}）`);
    props.forEach((i) => lines.push(`  • ${i.title}`));
  }

  return lines.join('\n');
}

async function sendLineNotify(token: string, message: string): Promise<boolean> {
  const res = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
    body: new URLSearchParams({ message }),
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  /* ── Auth check ─────────────────────────────────────────────────────── */
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret = req.headers.get('x-cron-secret');
  const session = await getSession();

  const isCronRequest = cronSecret && headerSecret === cronSecret;
  const isAdminRequest = session.isAdmin === true;

  if (!isCronRequest && !isAdminRequest) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  /* ── Fetch all eligible clients ─────────────────────────────────────── */
  const clients = await query<LineClient>(
    `SELECT client_id, display_name, line_notify_token
     FROM clients
     WHERE has_line_service = true
       AND line_notify_token IS NOT NULL
       AND line_notify_token <> ''
       AND status = 'active'`,
    []
  );

  if (clients.length === 0) {
    return NextResponse.json({ dispatched: 0, skipped: 0, results: [], note: 'No eligible clients' });
  }

  const results: DispatchResult[] = [];

  for (const client of clients) {
    try {
      const { items, today, summary } = await getDailyTasks(client.client_id);

      if (summary.total === 0) {
        results.push({ client_id: client.client_id, display_name: client.display_name, status: 'skipped', task_count: 0 });
        continue;
      }

      const message = buildMessage(client.display_name, items, today, summary);
      const ok = await sendLineNotify(client.line_notify_token, message);

      results.push({
        client_id: client.client_id,
        display_name: client.display_name,
        status: ok ? 'sent' : 'error',
        task_count: summary.total,
        error: ok ? undefined : 'LINE Notify API returned error',
      });
    } catch (e: unknown) {
      results.push({
        client_id: client.client_id,
        display_name: client.display_name,
        status: 'error',
        error: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }

  const dispatched = results.filter((r) => r.status === 'sent').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  return NextResponse.json({ dispatched, skipped, results });
}
