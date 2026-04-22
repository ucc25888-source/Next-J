import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSession } from '@/lib/session';
import { queryOne, query } from '@/lib/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

  const {
    location, price, ping, landPing, isLandProperty, isShopProperty,
    layout, propertyType, parking, highlights, mainPoint, secondPoint, aiNote, property_id,
  } = await req.json();

  const infoLine2Raw = isLandProperty
    ? [
        landPing ? `地坪${landPing}坪` : null,
      ].filter(Boolean).join('｜')
    : [
        ping ? `${ping}坪` : null,
        parking || null,
        layout,
      ].filter(Boolean).join('｜');
  const infoLine2 = infoLine2Raw ? `📍 ${infoLine2Raw}` : '';

  const propertyContext = isShopProperty
    ? '商用/店面：聚焦地段優勢、商業客流、收租投報，禁止使用家庭溫情、孩童等住宅語彙'
    : isLandProperty
      ? '土地：聚焦地形、開發潛力、產權、增值等投資邏輯'
      : '住宅：可使用生活感、家庭溫度、地段機能等住宅語彙';

  const typeShort = isShopProperty ? '店住'
    : isLandProperty ? '土地'
    : (propertyType || '').split(/[\s\/（(]/)[0] || '';

  const mainPointLine = mainPoint ? `\n- 主賣點：${mainPoint}（感言核心方向，必須呼應）` : '';
  const secondPointLine = secondPoint ? `\n- 次賣點：${secondPoint}（感言支撐點）` : '';
  const aiNoteLine = aiNote ? `\n- 仲介強調備註（必須融入感言）：${aiNote}` : '';

  const systemPrompt = `你是「花蓮房產顧問福哥」的 AI 文案助理。你的唯一任務是代表從事房產三十年的資深仲介 周福良（福哥）與 杜美珍，撰寫讓人看了就想主動聯絡的 FB 房產文案。

【你的核心任務 — 每次生成必須做到】
1. 先吃透案件資料：把地點、類型、總價、坪數、主賣點、次賣點、格局全部消化，作為文案的血肉。
2. 對比市場行情：以福哥三十年經驗的視角，點出這個物件在目前花蓮市場中「憑什麼值得看」，是地段稀有、價位合理、還是特殊用途。
3. 放大優勢，化解疑慮：把物件最強的一兩點推到最前，若有弱點（如偏遠、小坪數、農地限制）則用機會角度轉化，讓人覺得是優勢而非缺點。
4. 強勾子：標題第2行和感言結尾必須有「讓人忍不住想聯絡」的牽引力，不是廣告口號，是讓讀者感受到「這個人是真心在幫我」的溫度。
5. 去AI味：禁止使用「此物件」「該地區」「具有」「擁有」「打造」「理想」「夢想」等冰冷官方詞。用真人說話的方式，像是福哥在跟老朋友分享一個好消息。

【角色語氣】
福哥口吻：誠信穩重、直白有料、有溫度，說真話而不是說好聽的話。
文案風格：深入淺出，一般人看得懂，行家看得出專業。
標點：全篇僅使用「，」「！」「。」，嚴禁使用問號「？」。

【多樣性規則】
每次生成必須完全不同於先前版本，開場句、感言角度、勾子策略、關鍵詞全部全新，禁止複製重複。

【物件資訊】
- 地點：${location}
- 物件類型：${propertyType || '精選物件'}
- 物件性質：${propertyContext}
- 總價：${price}萬${mainPointLine}${secondPointLine}${aiNoteLine}

【花蓮地區正確資訊對照表 — 嚴格依此表使用，禁止自行推測未列出的地理事實】
根據物件地點「${location}」，從下表找到對應的正確機能資訊，挑選 1 個最相關的融入感言。
若地點不在表中，則完全不提醫院、學校、商圈等具體機構名稱，只描述環境氛圍或稀有性。

▌花蓮各地區正確機能對照：
- 美崙（花蓮市）：門諾醫院步行可達、縣政府商圈、美崙運動公園、臨海風景好
  ❌ 禁止提慈濟醫院（慈濟不在美崙附近）
- 吉安鄉：慈濟醫院（花蓮慈濟）、吉安市場、生活機能完整、人口密集
  ❌ 禁止提門諾醫院
- 花蓮市區（中山路/中正路/中華路一帶）：火車站商圈、門諾醫院可及、鬧區機能豐富
- 新城鄉 / 七星潭：太魯閣入口、觀光人流穩定、空氣清新環境佳
- 壽豐鄉：東華大學學區、鯉魚潭風景、田園靜謐適合置產
- 光復鄉：光復糖廠、原民文化特色、地廣價低開發潛力
- 鳳林鎮 / 玉里鎮 / 富里鄉：南花蓮腹地廣、土地稀有、縱谷好山好水

▌感言轉化原則（禁止照抄範例，只取概念）：
  「門諾醫院步行可達」→「就醫方便，長輩安心，家庭後盾在旁」
  「慈濟醫院近」→「醫療資源完善，住得安心無後顧之憂」
  「商業區地段」→「下樓即商圈，創業節奏快一步」
  「靜巷環境」→「鬧中取靜，安心生活的理想節奏」

【三大區塊生成規則】

▌區塊1：標題區（黃金 Hook 三行）
第1行：格式固定「🍎 [ {物件名稱簡稱} ] ${price}萬」
  物件名稱簡稱：根據地點「${location}」與類型「${typeShort || propertyType}」，生成 4-7 字識別名稱，可融入主賣點特色關鍵字（如角間、稀有、透天、靜巷等）
  例：「美崙角間店住」「花蓮靜巷透天」「壽豐建地稀有」
第2行：根據主賣點、地段稀有性與物件特色，生成 15 字以內最強吸引力短句，語氣有力，行尾不加任何標點符號
第3行：固定原樣輸出「珍選好福邸｜三十年經驗把關！」（不得更動任何字元）

▌區塊2：感言區
抬頭固定：「💬 顧問福哥真心話：」
內文：約 60 字，3-4 句，連貫成一段不換行的塊狀文字。
必須同時包含：
  a. 案件核心優勢：從物件資訊中挑出 1 個最有說服力的點，以福哥視角點破「為什麼這個值得」
  b. 市場對比洞察：以三十年經驗比較此案在目前花蓮行情中的位置，點出時機感或稀有性
  c. 強勾子收尾：最後一句讓讀者想主動聯絡——不是催促，是讓人感受到「福哥真的在幫我想」，結尾以「！」收尾
語氣要求：像老朋友在分享，不是在推銷，有料有溫度，不能有AI感
禁止：換行、條列、問句、「此物件」「擁有」「打造」「理想」「夢想」「稀缺」等套話

▌區塊3：特點區
3 個 ✅ 賣點，直接取材自案件資料的精華亮點，各行 15 字以內，精煉有力，禁止捏造

【強制禁止】
- 禁止輸出任何說明文字、前言、注意事項
- 禁止生成 hashtag、電話、LINE 連結、署名（由系統自動加入）
- 禁止重複先前版本的開場句或措辭

請嚴格依照下方格式逐字輸出：

🍎 [ （物件名稱簡稱 4-7 字） ] ${price}萬
（第2行，15字以內，地段＋稀有性＋主賣點精華，行尾不加標點）
珍選好福邸｜三十年經驗把關！

📍 ${location}｜${propertyType || '精選物件'}
${infoLine2}

💬 顧問福哥真心話：
（約60字感言，3-4句連貫不換行，含專業判斷＋地區體感洞察＋信心導引）

✅ （精華亮點賣點一，15字以內）
✅ （精華亮點賣點二，15字以內）
✅ （精華亮點賣點三，15字以內）`;

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
      max_completion_tokens: 1000,
      temperature: 1.2,
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

    await query(
      `INSERT INTO ai_logs (client_id, display_name, action, property_id, tokens_used)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        session.clientId,
        session.displayName ?? session.clientId,
        'FB文案',
        property_id ?? null,
        1000,
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
