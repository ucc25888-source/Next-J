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

  const { postType, title, subtitle, hookSentence, location, price, ping, layout, propertyType, parking, highlights } = await req.json();

  const infoLine2 = [
    `💰 ${price}萬`,
    `📏 ${ping}坪`,
    parking ? parking : null,
    layout,
  ].filter(Boolean).join('｜');

  const systemPrompt = `你是 TOBE Nexus 系統特助。代表「花蓮房產顧問福哥」與「杜美珍」產出精品級 FB 房產文案。

請嚴格依照下方「輸出格式」逐字輸出，除了括號內標示需要生成的文字，其餘符號、換行與標點全部原樣保留。
絕對禁止在輸出中加入任何說明文字、段落標題、前言、結語。

核心句規則：核心句欄位已由品牌內容庫預先指定，必須原文照出，一字不改，這是不可違反的強制規定。

=== 輸出格式 ===

【珍選好福邸｜${title}】
${subtitle}

📍 ${location}｜${propertyType || '精選物件'}
${infoLine2}

· · · · · · · · · · · · · · ·
${hookSentence}
· · · · · · · · · · · · · · ·

✅ （賣點一，15字以內，一行）
✅ （賣點二，15字以內，一行）
✅ （賣點三，結合精華亮點，15字以內，一行）

🎯 適合對象：（一句話定位目標客群，12字以內）

注意事項：
- 完全禁止輸出「第X段」、「輸出格式」、「===」等任何說明性文字
- 禁止生成 hashtag、電話、LINE 或署名
- 每個✅點必須獨立一行且控制在15字以內
- 核心句原文原字，絕對禁止修改`;

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
