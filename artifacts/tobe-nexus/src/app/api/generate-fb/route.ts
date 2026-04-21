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

  const { postType, hookType, location, price, ping, landPing, isLandProperty, isShopProperty, layout, propertyType, parking, highlights, mainPoint, secondPoint, property_id } = await req.json();

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

  const emotionAxisLine = (mainPoint || secondPoint)
    ? `\n【AI 情緒主軸 — HOOK 核心】\n${mainPoint ? `- 主賣點：${mainPoint}（文案的最強情緒錨點，HOOK 開場白與整篇語氣必須圍繞此核心展開）` : ''}${secondPoint ? `\n- 次賣點：${secondPoint}（文案中段的支撐點，強化主賣點的說服力）` : ''}`
    : '';

  const COPY_ANGLES = isShopProperty ? [
    '從「人流商機」切入：用行人視角描述站在這個位置眼前的熱鬧景象，讓讀者感受到商機就在眼前',
    '從「投資報酬試算」切入：用具體數字邏輯說明收租潛力，以理性分析吸引投資型客戶',
    '從「稀缺性警示」切入：強調這種地段這種物件市場極少，不行動就會後悔',
    '從「自營創業」切入：描述經營者在這個空間實現夢想的場景，激發創業欲望',
    '從「地段增值未來」切入：點出區域發展趨勢，讓讀者看見持有的長期價值',
    '從「差異化比較」切入：隱性對比其他店面，突顯這個物件在曝光、格局、條件上的優越',
  ] : isLandProperty ? [
    '從「開發潛力想像」切入：讓讀者想像這塊地未來可以蓋什麼、創造什麼可能性',
    '從「稀有資產保值」切入：強調土地不會折舊、抗通膨、財富傳承的核心邏輯',
    '從「地形地段分析」切入：專業描述地形優勢，展現福哥三十年看地的專業眼光',
    '從「投資時機」切入：點出現在入手的時間紅利，製造不買就後悔的急迫感',
    '從「使用彈性」切入：描述農地、建地多樣用途，讓不同需求的買家都能對號入座',
  ] : [
    '從「生活場景想像」切入：帶領讀者用第一視角想像住進去之後的日常，喚起情感共鳴',
    '從「家人幸福感」切入：以家庭溫度出發，描述孩子成長、全家安心的畫面',
    '從「地段機能」切入：用周邊生活圈的豐富性說服讀者，這裡住著最方便',
    '從「資產保值邏輯」切入：以理性角度點出這個社區未來的增值潛力，兼顧住與投',
    '從「稀缺機會」切入：強調這個格局這個價格在這個地段已是市場難得的選擇',
    '從「微故事開場」切入：用一個住戶或看房者的微小生活故事帶出物件最打動人的特點',
  ];
  const randomAngle = COPY_ANGLES[Math.floor(Math.random() * COPY_ANGLES.length)];

  const systemPrompt = `你是 TOBE Nexus 系統特助。代表「花蓮房產顧問福哥」與「杜美珍」產出精品級 FB 房產文案。

【強制多樣性規則】
本次文案必須完全獨立、與先前任何版本截然不同。開場句、關鍵詞、比喻、結構順序都必須全新，禁止複製或相似於任何已生成過的內容。

【本次文案設定】
- 貼文類型：${postType}
- HOOK 風格：${hookType}（${hookStyleDesc}）
- 物件性質：${propertyContext}
- 🎯 本次指定切入角度（必須嚴格執行）：${randomAngle}${emotionAxisLine}

【標題與副標生成規則（嚴格遵守）】
- 第一行「標題」：緊扣物件類型與${postType}主題，繁體中文，10字以內（不含標點），語氣精煉有力
- 第二行「副標」：必須嚴格遵守以下格式：【前段5–7字】+【全形逗號】+【後段5–7字】，前後段合計漢字數12–14字，禁止整行不加逗號；禁止使用「你的第一間房」「回家」「家人」等住宅語彙來描述商用或土地物件
  - 正確示例：「三面曝光旺地段，商機財源滾滾來」（前6後6=12字✓）
  - 正確示例：「稀有角間搶先看，投報利潤逐年旺」（前6後6=12字✓）
  - 錯誤示例：「三面曝光卡位旺點商機」（無逗號，10字✗）

【HOOK 開場句生成規則】
- 依照 HOOK 風格（${hookType}）產出一句高情緒價值的開場白
- 緊扣主賣點，句子要有畫面感或衝擊力，約20-30字
- 商用物件：聚焦地段、人流、商機、投報，禁止住宅語彙
- 土地物件：聚焦開發、增值、稀有性、地形優勢
- 住宅物件：可用生活感、家庭溫度、環境機能

【✅賣點生成規則（最重要）】
- 使用者已提供「精華亮點」作為賣點來源，這是第一優先依據
- 三個✅賣點必須直接取材自或改寫自精華亮點，不可自行捏造與精華亮點無關的內容
- 若精華亮點不足三項，可補充一項符合物件類型的自然延伸賣點
- 每個✅點控制在15字以內，語氣精煉有力

【人設金句生成規則（最後三行）— 違反任一條即失效，必須重新生成】

▌字數規則（最重要，逐字計數）：
- 每行結構：漢字①②③④⑤，漢字⑥⑦⑧⑨⑩。
- 逗號前恰好5個漢字，逗號後恰好5個漢字，加上全形逗號與句號，每行共12個字元
- ✅ 正確：「福哥深耕細，眼光精準利。」（前5後5，共10漢字）
- ✅ 正確：「三十載磨礪，選宅眼光銳。」（前5後5，共10漢字）
- ❌ 錯誤：「福哥深耕，眼光穩健。」（前4後4=8漢字，少兩字）
- ❌ 錯誤：「福哥三十年深耕，眼光精準。」（前6後4=10漢字但逗號位置錯）

▌押韻規則（三行句尾必須同韻不同字）：
- 三行最後一個漢字（句號前的字）必須押同一個韻，且三個字必須互不相同
- ✅ 正確押韻：「財、來、快」（同押 ai 韻，三字各異）
- ✅ 正確押韻：「旺、強、廣」（同押 ang 韻，三字各異）
- ✅ 正確押韻：「穩、準、順」（同押 un 韻，三字各異）
- ❌ 禁止：「健、健、健」（三行用同一個字，即使同韻也不合格）
- ❌ 禁止：「旺、旺、旺」（重複同一字）

▌主題元素（靈活取用）：
- 福哥三十年經驗、在地深耕、專業眼光、精準判斷
- 美珍細心服務、雙人搭檔、效率到位、關懷備至
- 珍選好福邸、選好宅帶財、福氣聚財、好運連連
- 依物件類型調整語氣：商用→專業沉穩、土地→權威有力、住宅→溫柔真誠

【強制規則，違反即失效】
- 完全禁止輸出任何說明文字、段落標題、前言、結語、注意事項
- 禁止輸出「輸出格式」、「第X段」、「注意事項」等說明性非內容文字
- 「=== 珍選好福邸 ===」這一行是指定格式分隔符，只能出現一次，原樣保留，不得重複
- 禁止生成 hashtag、電話、LINE 或署名

請嚴格依照下方格式逐字輸出。括號內標示為需要生成的內容，其餘符號、換行、標點全部原樣保留，不得增減任何字元。

【珍選好福邸｜（標題，10字以內，緊扣${postType}與物件類型）】
（副標前段5–7漢字），（副標後段5–7漢字）

📍 ${location}｜${propertyType || '精選物件'}
${infoLine2}

· · · · · · · · · · · · · · ·
（HOOK 開場句，20-30字，依 ${hookType} 風格，緊扣主賣點，高情緒價值）
· · · · · · · · · · · · · · ·

✅ （取材自精華亮點的賣點一，15字以內）
✅ （取材自精華亮點的賣點二，15字以內）
✅ （取材自精華亮點的賣點三，15字以內）

🎯 適合對象：（一句話定位目標客群，12字以內）

=== 珍選好福邸 ===
（人設金句第一行：①②③④⑤，⑥⑦⑧⑨⑩。←逗號前5字逗號後5字共10漢字，句尾字=韻腳A）
（人設金句第二行：①②③④⑤，⑥⑦⑧⑨⑩。←逗號前5字逗號後5字共10漢字，句尾字=韻腳B≠A）
（人設金句第三行：①②③④⑤，⑥⑦⑧⑨⑩。←逗號前5字逗號後5字共10漢字，句尾字=韻腳C≠A≠B，A/B/C三字同韻）`;

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
      temperature: 1.3,
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
