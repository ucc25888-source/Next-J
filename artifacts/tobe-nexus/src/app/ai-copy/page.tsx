"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Sparkles,
  Copy,
  RefreshCw,
  Building2,
  CheckCheck,
  ChevronDown,
  Info,
} from "lucide-react";

const toneOptions = [
  { value: "professional", label: "專業正式", desc: "穩重可信" },
  { value: "warm", label: "溫馨親切", desc: "貼近生活" },
  { value: "urgent", label: "限時急售", desc: "製造緊迫感" },
  { value: "luxury", label: "頂級豪宅", desc: "彰顯身份" },
];

const propertyTypes = ["住宅", "套房", "店面", "辦公室", "廠房", "土地"];

interface FormState {
  address: string;
  price: string;
  area: string;
  rooms: string;
  features: string;
  tone: string;
  propertyType: string;
}

export default function AiCopyPage() {
  const [form, setForm] = useState<FormState>({
    address: "",
    price: "",
    area: "",
    rooms: "",
    features: "",
    tone: "professional",
    propertyType: "住宅",
  });
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleGenerate = async () => {
    if (!form.address || !form.price) {
      setError("請填寫物件地址與售價");
      return;
    }
    setError("");
    setIsGenerating(true);
    setGeneratedCopy("");

    try {
      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { copy?: string; error?: string };
      if (data.error) {
        setError(data.error);
      } else {
        setGeneratedCopy(data.copy ?? "");
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedCopy) return;
    await navigator.clipboard.writeText(generatedCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="AI 文案生成"
        badge="Copywriting"
        subtitle="利用 OpenAI GPT 自動生成 Facebook 房產銷售文案"
      />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
          {/* ── Input Panel ── */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-glacier-200/[0.06] bg-titanium-950/30 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-aurora-500" />
              <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">
                物件資訊輸入
              </h2>
            </div>

            <div className="flex-1 p-6 space-y-5">
              {/* Property Type */}
              <div>
                <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">
                  物件類型
                </label>
                <div className="relative">
                  <select
                    value={form.propertyType}
                    onChange={(e) => update("propertyType", e.target.value)}
                    className="w-full appearance-none bg-titanium-800 border border-glacier-200/[0.08] rounded-lg px-3 py-2.5 text-sm text-glacier-200 focus:outline-none focus:border-aurora-500/50 transition-colors cursor-pointer"
                  >
                    {propertyTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-glacier-500 pointer-events-none" />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">
                  物件地址{" "}
                  <span className="text-aurora-500 normal-case tracking-normal">*</span>
                </label>
                <input
                  type="text"
                  placeholder="例：台北市信義區信義路五段..."
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="w-full bg-titanium-800 border border-glacier-200/[0.08] rounded-lg px-3 py-2.5 text-sm text-glacier-200 placeholder-glacier-600 focus:outline-none focus:border-aurora-500/50 transition-colors"
                />
              </div>

              {/* Price & Area */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">
                    售價（萬）<span className="text-aurora-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例：3,280"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    className="w-full bg-titanium-800 border border-glacier-200/[0.08] rounded-lg px-3 py-2.5 text-sm text-glacier-200 placeholder-glacier-600 focus:outline-none focus:border-aurora-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">
                    坪數
                  </label>
                  <input
                    type="text"
                    placeholder="例：42.5"
                    value={form.area}
                    onChange={(e) => update("area", e.target.value)}
                    className="w-full bg-titanium-800 border border-glacier-200/[0.08] rounded-lg px-3 py-2.5 text-sm text-glacier-200 placeholder-glacier-600 focus:outline-none focus:border-aurora-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Layout */}
              <div>
                <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">
                  格局
                </label>
                <input
                  type="text"
                  placeholder="例：3房2廳2衛"
                  value={form.rooms}
                  onChange={(e) => update("rooms", e.target.value)}
                  className="w-full bg-titanium-800 border border-glacier-200/[0.08] rounded-lg px-3 py-2.5 text-sm text-glacier-200 placeholder-glacier-600 focus:outline-none focus:border-aurora-500/50 transition-colors"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">
                  物件特色
                </label>
                <textarea
                  rows={3}
                  placeholder="例：棟距寬、採光佳、近捷運、視野好、全新裝潢..."
                  value={form.features}
                  onChange={(e) => update("features", e.target.value)}
                  className="w-full bg-titanium-800 border border-glacier-200/[0.08] rounded-lg px-3 py-2.5 text-sm text-glacier-200 placeholder-glacier-600 focus:outline-none focus:border-aurora-500/50 transition-colors resize-none"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-3">
                  文案語氣
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {toneOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("tone", opt.value)}
                      className={`px-3 py-2.5 rounded-lg text-left border transition-all duration-150 ${
                        form.tone === opt.value
                          ? "bg-aurora-500/10 border-aurora-500/30 text-aurora-400"
                          : "bg-titanium-800 border-glacier-200/[0.07] text-glacier-400 hover:border-glacier-200/15"
                      }`}
                    >
                      <p className="text-[12px] font-semibold">{opt.label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-danger/10 border border-danger/20 rounded-lg">
                  <Info className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />
                  <p className="text-xs text-danger">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-aurora-500 text-titanium-950 text-sm font-bold rounded-lg hover:bg-aurora-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-aurora-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AI 生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    生成 FB 銷售文案
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Output Panel ── */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-glacier-200/[0.06] bg-titanium-950/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-aurora-500" />
                <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">
                  AI 生成結果
                </h2>
              </div>
              {generatedCopy && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-titanium-800 border border-glacier-200/[0.08] text-glacier-400 hover:border-aurora-500/30 hover:text-aurora-400 transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5" /> 已複製
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> 複製文案
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 p-6">
              {generatedCopy ? (
                <div className="h-full bg-titanium-950/50 border border-glacier-200/[0.06] rounded-xl p-5 overflow-auto">
                  <p className="text-sm text-glacier-200 leading-relaxed whitespace-pre-wrap">
                    {generatedCopy}
                  </p>
                </div>
              ) : (
                <div className="h-full min-h-64 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-aurora-500/[0.06] border border-aurora-500/15 flex items-center justify-center mb-5">
                    <Sparkles className="w-7 h-7 text-aurora-500/40" />
                  </div>
                  <p className="text-sm font-semibold text-glacier-400">
                    填寫左側物件資訊
                  </p>
                  <p className="text-xs text-glacier-600 mt-1 max-w-48">
                    點擊「生成 FB 銷售文案」即可由 AI 自動撰寫
                  </p>
                  <div className="mt-6 px-4 py-3 bg-titanium-950/60 border border-glacier-200/[0.06] rounded-lg max-w-xs">
                    <p className="text-[10px] text-glacier-600 leading-relaxed">
                      需在 Replit Secrets 中設定{" "}
                      <code className="text-aurora-500/80 font-mono bg-titanium-800 px-1 rounded text-[9px]">
                        OPENAI_API_KEY
                      </code>{" "}
                      才可使用 AI 生成功能
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
