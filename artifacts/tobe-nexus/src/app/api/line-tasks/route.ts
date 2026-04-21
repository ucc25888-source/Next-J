/**
 * /api/line-tasks — LINE Messaging API integration stub
 *
 * HOW TO ACTIVATE LINE PUSH NOTIFICATIONS:
 * ─────────────────────────────────────────
 * 1. Create a LINE Official Account and enable the Messaging API channel.
 * 2. Get your "Channel Access Token" from the LINE Developers Console.
 * 3. Set the environment variable: LINE_CHANNEL_ACCESS_TOKEN=<your token>
 * 4. For each client, store their LINE User ID in the `clients` table
 *    (add a `line_user_id` column).
 * 5. Uncomment the push logic below and call this endpoint via a cron job
 *    (e.g. every morning at 08:00 using Vercel Cron or a scheduler).
 *
 * ENDPOINT: POST /api/line-tasks
 * Accepts: { clientId: string }  (or reads from session for single-user use)
 * Returns: { sent: boolean, taskCount: number, items: DailyFocusItem[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDailyTasks } from '@/lib/getDailyTasks';
// import type { DailyFocusItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  /* ── Core data (same as webapp) ── */
  const { items, today, summary } = await getDailyTasks(session.clientId);

  /* ── LINE push (activate when ready) ──────────────────────────────────
  const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const lineUserId = await getClientLineUserId(session.clientId); // implement this

  if (LINE_TOKEN && lineUserId && summary.total > 0) {
    const messages = buildLineMessages(items, today);
    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_TOKEN}`,
      },
      body: JSON.stringify({ to: lineUserId, messages }),
    });
    return NextResponse.json({ sent: true, taskCount: summary.total, items });
  }
  ─────────────────────────────────────────────────────────────────────── */

  /* ── Stub response (LINE not yet connected) ── */
  return NextResponse.json({
    sent: false,
    notice: 'LINE API not yet connected. Set LINE_CHANNEL_ACCESS_TOKEN to activate.',
    taskCount: summary.total,
    today,
    summary,
    items,
  });
}

export async function POST(req: NextRequest) {
  /* Future: Receive LINE webhook events (user replies, button taps) */
  const body = await req.json().catch(() => ({}));
  console.log('[LINE Webhook]', JSON.stringify(body));
  return NextResponse.json({ ok: true });
}

/*
── LINE message builder (activate when ready) ──────────────────────────────
function buildLineMessages(items: DailyFocusItem[], today: string) {
  const overdue  = items.filter(i => i.is_overdue && i.type !== 'property');
  const todayArr = items.filter(i => !i.is_overdue && i.type !== 'property');
  const props    = items.filter(i => i.type === 'property');

  const lines: string[] = [
    `📋 每日重點 ${today}`,
    '',
  ];

  if (overdue.length > 0) {
    lines.push(`🔴 逾期未處理（${overdue.length}）`);
    overdue.forEach(i => lines.push(`  • ${i.title} — ${i.subtitle}`));
    lines.push('');
  }
  if (todayArr.length > 0) {
    lines.push(`🔵 今日任務（${todayArr.length}）`);
    todayArr.forEach(i => lines.push(`  • ${i.title} — ${i.subtitle}`));
    lines.push('');
  }
  if (props.length > 0) {
    lines.push(`🟡 委託到期提醒（${props.length}）`);
    props.forEach(i => lines.push(`  • ${i.title}`));
  }

  return [{ type: 'text', text: lines.join('\n') }];
}
*/
