import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSession } from '@/lib/session';
import { queryOne, query } from '@/lib/db';

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.clientId) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const currentMonthKey = new Date().toISOString().slice(0, 7).replace('-', '');

  const clientRow = await queryOne<{
    monthly_quota: number;
    used_this_month: number;
    month_key: string;
    status: string;
  }>(
    'SELECT monthly_quota, used_this_month, month_key, status FROM clients WHERE client_id = $1',
    [session.clientId]
  );

  if (!clientRow) {
    return NextResponse.json({ error: '帳號不存在' }, { status: 404 });
  }

  const actualUsed =
    clientRow.month_key !== currentMonthKey ? 0 : clientRow.used_this_month;

  if (actualUsed >= clientRow.monthly_quota) {
    return NextResponse.json(
      { error: '本月 AI 文案配額已用盡，案件管理功能仍可正常使用' },
      { status: 429 }
    );
  }

  const { postType, location, price, ping, layout, hookType, highlights } = await req.json();

  const systemPrompt = `你是 TOBE Nexus 系統特助。代表「花蓮房產顧問福哥」與「杜美珍」產出精品級 FB 文案。

[視覺與結構規範]

標題：【珍選好福邸｜${postType}】（10字內）

大字資訊區：
📍 ${location}
💰 ${price}萬｜📏 ${ping}坪｜🏠 ${layout}

戰略分隔（必須原樣保留這行）：
—————————————————

中間內容：根據「${hookType}」方向，產出一句高吸睛戰略重擊金句（不超過30字）。

精華整理：3個✅點，包含區域優勢與投資價值（結合下方輸入的精華亮點）。

對象：🎯 適合對象：（根據物件特性與地點精準定位客群，一句話）。

強制品牌標籤（必須獨立成行放在文案最末端，不可省略）：
#珍選好福邸
#花蓮房產顧問福哥
#TOBENexus

注意：請直接輸出 FB 文案本文，不要加任何前言或解釋。不要生成聯繫電話、LINE 或署名，系統會自動附加。`;

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `精華亮點（請融入文案）：\n${highlights || '請根據地點、物件類型與價格自行發揮亮點'}`,
        },
      ],
      stream: true,
      max_completion_tokens: 1500,
    });

    await query(
      `UPDATE clients
       SET used_this_month = CASE WHEN month_key = $1 THEN used_this_month + 1 ELSE 1 END,
           month_key = $1
       WHERE client_id = $2`,
      [currentMonthKey, session.clientId]
    );

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('OpenAI generation error:', err);
    return NextResponse.json({ error: 'AI 生成失敗，請稍後再試' }, { status: 500 });
  }
}
