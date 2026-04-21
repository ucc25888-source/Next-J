/**
 * /api/line-tasks  (GET)
 *
 * Single-user LINE Notify push — uses the logged-in client's own
 * `line_notify_token` and `has_line_service` flag.
 *
 * Returns daily tasks regardless; LINE push only happens when:
 *   1. has_line_service = true
 *   2. line_notify_token is set
 *
 * POST /api/line-tasks  — receives LINE webhook events (future use)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { queryOne } from '@/lib/db';
import { getDailyTasks } from '@/lib/getDailyTasks';

export const dynamic = 'force-dynamic';

interface LineClientRow {
  has_line_service: boolean;
  line_notify_token: string | null;
  display_name: string;
}

export async function GET() {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  /* ── Core task data ── */
  const { items, today, summary } = await getDailyTasks(session.clientId);

  /* ── Read client LINE settings ── */
  const client = await queryOne<LineClientRow>(
    'SELECT has_line_service, line_notify_token, display_name FROM clients WHERE client_id = $1',
    [session.clientId]
  );

  const canSendLine = client?.has_line_service && client?.line_notify_token;

  /* ── LINE Notify push ─────────────────────────────────────────────────
     Sends a text message to the user's personal LINE via LINE Notify.
     The token is obtained from https://notify.line.me/my (personal use)
     or from the LINE Notify API console for official service integrations.
  ─────────────────────────────────────────────────────────────────────── */
  let sent = false;
  if (canSendLine && summary.total > 0) {
    const message = buildMessage(client!.display_name, items, today, summary);
    const res = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${client!.line_notify_token}`,
      },
      body: new URLSearchParams({ message }),
    });
    sent = res.ok;
  }

  return NextResponse.json({
    sent,
    has_line_service: client?.has_line_service ?? false,
    line_configured: !!client?.line_notify_token,
    taskCount: summary.total,
    today,
    summary,
    items,
    notice: !canSendLine
      ? (client?.has_line_service
          ? 'LINE 加值服務已開啟，但尚未設定 LINE Notify Token。'
          : 'LINE 加值服務尚未開啟。')
      : null,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  console.log('[LINE Webhook]', JSON.stringify(body));
  return NextResponse.json({ ok: true });
}

/* ── Message builder ───────────────────────────────────────────────────── */
function buildMessage(
  displayName: string,
  items: Awaited<ReturnType<typeof getDailyTasks>>['items'],
  today: string,
  summary: Awaited<ReturnType<typeof getDailyTasks>>['summary']
): string {
  const lines: string[] = [
    `📋 ${displayName}｜每日重點 ${today}`,
    `共 ${summary.total} 項任務`,
    '',
  ];

  const overdue  = items.filter((i) => i.is_overdue && i.type !== 'property');
  const todayArr = items.filter((i) => !i.is_overdue && i.type !== 'property');
  const props    = items.filter((i) => i.type === 'property');

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
