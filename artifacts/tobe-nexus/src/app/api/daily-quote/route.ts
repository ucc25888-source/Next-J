import { NextResponse } from "next/server";
import OpenAI from "openai";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

interface CachedQuote { text: string; author: string; date: string; }
const memCache = new Map<string, CachedQuote>();

const FALLBACK = [
  { text: "成交不是終點，是信任的開始。", author: "房產哲學" },
  { text: "你所做的每一個準備，都是在為某個美好的結果鋪路。", author: "每日正能量" },
  { text: "好的房產顧問，賣的是安心，不只是坪數。", author: "房產哲學" },
  { text: "花蓮的山海，是最好的鄰居。把這份美好，傳遞給每一位買家。", author: "在地情懷" },
  { text: "不要等到一切完美才出發，出發了才會完美。", author: "每日正能量" },
  { text: "你的溫度，是任何科技都取代不了的核心競爭力。", author: "工作哲學" },
  { text: "真正的財富，是把自己的時間花在真正重要的事情上。", author: "每日正能量" },
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
       ON CONFLICT (date) DO NOTHING`,
      [q.date, q.text, q.author]
    );
  } catch { /* best effort */ }
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  if (memCache.has(today)) return NextResponse.json(memCache.get(today));

  await ensureTable();

  const fromDb = await loadFromDb(today);
  if (fromDb) { memCache.set(today, fromDb); return NextResponse.json(fromDb); }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? process.env.DEV_OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `你是一位專為台灣房仲業者設計正能量訊息的創作者。
每天生成一句有力量、溫暖、適合分享給朋友的中文佳句。
主題可以是：房產智慧、工作心法、人生哲學、現代人的向上力量。
風格要有溫度、有深度、讓人看完想轉傳。
只回傳 JSON，格式為 {"text": "佳句內容", "author": "主題分類"}
author 從以下選一個：每日正能量、房產智慧、工作哲學、人生哲學、在地情懷、溝通之道`,
        },
        {
          role: "user",
          content: `今天是 ${today}，請生成今天的正能量佳句。只回傳 JSON，不需要任何多餘說明。`,
        },
      ],
      max_tokens: 200,
      temperature: 0.9,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { text: string; author: string };
      const result: CachedQuote = { ...parsed, date: today };
      memCache.set(today, result);
      await saveToDb(result);
      return NextResponse.json(result);
    }
    throw new Error("parse failed");
  } catch {
    const d = new Date();
    const idx = (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate()) % FALLBACK.length;
    const fallback: CachedQuote = { ...FALLBACK[idx], date: today };
    memCache.set(today, fallback);
    await saveToDb(fallback);
    return NextResponse.json(fallback);
  }
}
