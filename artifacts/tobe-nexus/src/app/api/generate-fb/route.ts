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
      { error: '本月生成額度已達上限，請聯繫 TOBE Nexus AI Hub 的客服開放權限。' },
      { status: 429 }
    );
  }

  const { postType, hookType, title, subtitle, hookSentence, location, price, ping, landPing, isLandProperty, isShopProperty, layout, propertyType, parking, highlights, property_id } = await req.json();

  const infoLine2 = isLandProperty
    ? [
        `💰 ${price}萬`,
        landPing ? `地坪${landPing}坪` : null,
      ].filter(Boolean).join('｜')
    : [
        `💰 ${price}萬`,
        ping ? `📏 ${ping}坪` : null,
        parking || null,
        layout,
      ].filter(Boolean).join('｜');

  const HOOK_STYLE: Record<string, string> = {
    '情感溫度鉤': '以生活畫面與情感溫度吸引讀者，喚起家的溫暖與幸福感，語氣柔和真誠',
    '專業焦慮鉤': '以地產專業知識點出讀者盲點或錯失風險，製造輕微焦慮後提供解方，語氣權威但不強硬',
    '知識佈道鉤': '以分享教育的口吻傳遞房地產知識與觀念，語氣像老師或前輩，平易近人',
    '利益誘惑鉤': '強調財務獲利、稀缺性與限時行動誘因，讓讀者感受到不行動就會損失，語氣積極有感染力',
    '無': '直接切入物件本身，不使用特定開場風格，平實自然呈現',
  };
  const hookStyleDesc = HOOK_STYLE[hookType] ?? HOOK_STYLE['情感溫度鉤'];

  const propertyContext = isShopProperty
    ? '本物件為商用/店面類型，賣點語氣應聚焦在地段優勢、收租投報、商業曝光度、人流量等商業邏輯，禁止使用家庭溫情、採光、孩童等住宅語彙'
    : isLandProperty
      ? '本物件為土地類型，賣點語氣應聚焦在地形、開發潛力、產權、增值等土地投資邏輯'
      : '本物件為住宅類型，賣點語氣可使用生活感、家庭溫度、地段機能等住宅語彙';

  const systemPrompt = `你是 TOBE Nexus 系統特助。代表「花蓮房產顧問福哥」與「杜美珍」產出精品級 FB 房產文案。

【本次文案設定】
- 貼文類型：${postType}
- HOOK 風格：${hookType}（${hookStyleDesc}）
- 物件性質：${propertyContext}

【✅賣點生成規則（最重要）】
- 使用者已提供「精華亮點」作為賣點來源，這是第一優先依據
- 三個✅賣點必須直接取材自或改寫自精華亮點，不可自行捏造與精華亮點無關的內容
- 若精華亮點不足三項，可補充一項符合物件類型的自然延伸賣點
- 每個✅點控制在15字以內，語氣精煉有力

【強制規則，違反即失效】
- 完全禁止輸出任何說明文字、段落標題、前言、結語、注意事項
- 禁止輸出「===」、「輸出格式」、「第X段」、「注意事項」等任何非內容文字
- 禁止生成 hashtag、電話、LINE 或署名
- 核心句欄位已由品牌內容庫預先指定，必須原文照出，一字不改

請嚴格依照下方格式逐字輸出。括號內標示為需要生成的內容，其餘符號、換行、標點全部原樣保留，不得增減任何字元。

【珍選好福邸｜${title}】
${subtitle}

📍 ${location}｜${propertyType || '精選物件'}
${infoLine2}

· · · · · · · · · · · · · · ·
${hookSentence}
· · · · · · · · · · · · · · ·

✅ （取材自精華亮點的賣點一，15字以內）
✅ （取材自精華亮點的賣點二，15字以內）
✅ （取材自精華亮點的賣點三，15字以內）

🎯 適合對象：（一句話定位目標客群，12字以內）`;

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: highlights
            ? `【精華亮點 — 三個✅賣點必須取材於此，優先使用原文或精煉改寫，禁止忽略】\n${highlights}`
            : `【未提供精華亮點】請根據物件地點「${location}」、類型「${propertyType}」與售價「${price}萬」自行判斷合適的賣點。`,
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

    if (property_id) {
      await query(
        `UPDATE properties SET fb_post_count = fb_post_count + 1 WHERE id = $1 AND client_id = $2`,
        [property_id, session.clientId]
      );
    }

    /* ── AI usage log ── */
    await query(
      `INSERT INTO ai_logs (client_id, display_name, action, property_id, tokens_used)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        session.clientId,
        session.displayName ?? session.clientId,
        `FB文案 · ${postType ?? ''}${hookType ? ` · ${hookType}` : ''}`,
        property_id ?? null,
        1500,
      ]
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
