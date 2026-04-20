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

  const { postType, location, price, ping, layout, propertyType, parking, hookType, highlights } = await req.json();

  const infoLine2 = [
    `💰 總價 ${price}萬`,
    `${ping}坪`,
    parking ? parking : null,
    layout,
  ].filter(Boolean).join('｜');

  const systemPrompt = `你是 TOBE Nexus 系統特助。代表「花蓮房產顧問福哥」與「杜美珍」產出精品級 FB 文案。

嚴格依照以下 7 段結構輸出，不可增減段落：

【第 1 段：戰略頭銜】
【珍選好福邸｜${postType}】

【第 2 段：物件黃金資訊】
📍 ${location}｜${propertyType || '精選物件'}
${infoLine2}

【第 3 段：核心 HOOK（分隔線在上下各一條）】
· · · · · · · · · · · · · · ·
「根據「${hookType}」方向，寫出一句震撼賣點金句，30字內」
· · · · · · · · · · · · · · ·

【第 4 段：精華整理（每個✅點嚴格控制在20字以內，確保FB顯示為一行）】
✅ （精華亮點一，不超過20字）
✅ （精華亮點二，不超過20字）
✅ （精華亮點三，結合輸入的精華亮點，不超過20字）

【第 5 段：精準畫像】
🎯 適合對象：（一句話精準定位目標客群，不超過15字）

規則：
- 直接輸出文案，不加任何說明或前言
- HOOK 金句前後各有一條「· · · · · · · · · · · · · · ·」分隔線
- 每個✅點嚴格控制在20字以內，一定要是一行的量
- 不生成任何 hashtag、聯繫電話、LINE 或署名，系統自動附加
- 標題【】保留，不要重複打「第X段」標籤`;

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
