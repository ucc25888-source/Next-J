import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const toneMap: Record<string, string> = {
  professional: "專業正式、值得信賴的語氣",
  warm: "溫馨親切、貼近生活的語氣",
  urgent: "製造urgency感、強調限時機會的語氣",
  luxury: "頂級豪華、彰顯身份地位的語氣",
};

interface CopyRequest {
  address: string;
  price: string;
  area: string;
  rooms: string;
  features: string;
  tone: string;
  propertyType: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API 金鑰未設定，請在環境變數中設定 OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const body = (await req.json()) as CopyRequest;
  const { address, price, area, rooms, features, tone, propertyType } = body;

  if (!address || !price) {
    return NextResponse.json({ error: "物件地址與售價為必填" }, { status: 400 });
  }

  const toneDescription = toneMap[tone] ?? toneMap["professional"];

  const prompt = `你是一位專業的台灣房仲業務，精通 Facebook 房產銷售文案撰寫。
請根據以下物件資訊，撰寫一則吸引人的 Facebook 銷售貼文：

物件類型：${propertyType}
物件地址：${address}
售價：${price} 萬
${area ? `坪數：${area} 坪` : ""}
${rooms ? `格局：${rooms}` : ""}
${features ? `物件特色：${features}` : ""}

語氣要求：${toneDescription}

撰寫規則：
- 開頭要有吸引眼球的亮點標題（可使用 emoji）
- 條列物件特色與優勢
- 強調地段與生活機能
- 結尾加上看屋聯絡資訊的邀請語
- 文案長度適中（300-500字），適合 Facebook 貼文
- 使用繁體中文
- 嚴禁使用過度浮誇或不實的描述

請直接輸出文案內容，不需要額外說明。`;

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const copy = response.choices[0]?.message?.content ?? "";
    return NextResponse.json({ copy });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 生成失敗，請稍後再試";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
