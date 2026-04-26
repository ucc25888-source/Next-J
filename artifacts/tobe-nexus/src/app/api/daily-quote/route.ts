import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

interface CachedQuote { text: string; author: string; date: string; }
const memCache = new Map<string, CachedQuote>();

const FALLBACK = [
  { text: "生活的壓力是真實的，但你扛過來的每一天，都是你最好的勳章。加油！", author: "每日正能量" },
  { text: "買一個家，不只是買一個地址，是買回你對生活最踏實的安心感。", author: "房產智慧" },
  { text: "不管今天有多難，你已經比你想像中的自己勇敢多了。繼續走，很棒。", author: "每日正能量" },
  { text: "花蓮的山與海，是最療癒的鄰居。希望有一天，我能幫你把家安在這裡。", author: "在地情懷" },
  { text: "找到對的家，就是找到一個讓你真正放鬆的地方。這件事值得慢慢找。", author: "房產智慧" },
  { text: "壓力大的時候，記得休息不是放棄，是為了走得更遠。你做得很好了。", author: "每日正能量" },
  { text: "存錢買房的路很辛苦，但每一步都是在為家人累積安全感，很值得。", author: "房產智慧" },
  { text: "努力工作的你，別忘了偶爾抬頭看看天空。美好的事情正在慢慢靠近你。", author: "每日正能量" },
  { text: "家，是你最累的時候想回去的地方。讓我幫你找到那個地方。", author: "房產智慧" },
  { text: "不是每件事都會馬上有結果，但只要你還在努力，就值得為自己鼓掌。", author: "每日正能量" },
];

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS daily_quotes_log (
      date        TEXT PRIMARY KEY,
      text        TEXT NOT NULL,
      author      TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `, []);
}

async function loadFromDb(date: string): Promise<CachedQuote | null> {
  try {
    const rows = await query<{ text: string; author: string }>(
      `SELECT text, author FROM daily_quotes_log WHERE date = $1`, [date]
    );
    if (rows.length > 0) return { text: rows[0].text, author: rows[0].author, date };
  } catch { /* table may not exist yet */ }
  return null;
}

async function saveToDb(q: CachedQuote) {
  try {
    await query(
      `INSERT INTO daily_quotes_log (date, text, author) VALUES ($1, $2, $3)
       ON CONFLICT (date) DO UPDATE SET text = EXCLUDED.text, author = EXCLUDED.author`,
      [q.date, q.text, q.author]
    );
  } catch { /* best effort */ }
}

async function deleteFromDb(date: string) {
  try {
    await query(`DELETE FROM daily_quotes_log WHERE date = $1`, [date]);
  } catch { /* best effort */ }
}

async function generateQuote(today: string): Promise<CachedQuote> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? process.env.DEV_OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `你是花蓮房仲業務員「福哥」，正在寫一句今天想傳給客戶或朋友的溫暖話語。

語氣規則（非常重要）：
- 以「業務員/朋友」的身份說話，對象是你的客戶或朋友
- 像是你今天早上想傳給朋友的一句祝福或鼓勵
- 不是在告訴業務員「你的工作是什麼」，而是業務員「說給別人聽」的話
- 有溫度、真誠、讓人看了心暖暖的

主題可以是（任選其一）：
1. 生活壓力與正能量（上班族、父母、年輕人的日常壓力）
2. 買房/租屋相關的正向話語（幫客戶找到家的心意）
3. 花蓮在地情感（山海風景帶來的療癒感）
4. 週一到週五的日常打氣話語
5. 簡短的人生小智慧，像朋友說的話

範例（正確方向）：
- 「生活的壓力是真實的，但你扛過來的每一天，都是最好的勳章。加油！」
- 「找到對的家，就是找到一個讓自己真正放鬆的地方。這件事值得慢慢找。」
- 「不管今天多難，你已經比你想的自己勇敢多了。繼續走，很棒。」

只回傳 JSON，格式為 {"text": "話語內容（30到60字最佳）", "author": "主題分類"}
author 從以下選一個：每日正能量、房產智慧、在地情懷、人生哲學、溝通之道`,
      },
      {
        role: "user",
        content: `今天是 ${today}，請生成今天想傳給客戶或朋友的一句溫暖話語。只回傳 JSON，不需要任何多餘說明。`,
      },
    ],
    max_tokens: 200,
    temperature: 0.92,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]) as { text: string; author: string };
    return { ...parsed, date: today };
  }
  throw new Error("parse failed");
}

export async function GET(req: NextRequest) {
  const today = new Date().toISOString().slice(0, 10);
  const force = req.nextUrl.searchParams.get("force") === "true";

  await ensureTable();

  if (force) {
    memCache.delete(today);
    await deleteFromDb(today);
  }

  if (!force && memCache.has(today)) return NextResponse.json(memCache.get(today));

  if (!force) {
    const fromDb = await loadFromDb(today);
    if (fromDb) { memCache.set(today, fromDb); return NextResponse.json(fromDb); }
  }

  try {
    const result = await generateQuote(today);
    memCache.set(today, result);
    await saveToDb(result);
    return NextResponse.json(result);
  } catch {
    const d = new Date();
    const idx = (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate()) % FALLBACK.length;
    const fallback: CachedQuote = { ...FALLBACK[idx], date: today };
    memCache.set(today, fallback);
    await saveToDb(fallback);
    return NextResponse.json(fallback);
  }
}
