"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ImageDown, Loader2, CheckCircle2 } from "lucide-react";

interface Quote { text: string; author: string; date: string; }

function QuoteCard() {
  const params = useSearchParams();
  const senderName = params.get("name") ?? "花蓮房產顧問福哥";

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
  }, []);

  const today = new Date().toLocaleDateString("zh-TW", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  useEffect(() => {
    fetch("/api/daily-quote")
      .then(r => r.json())
      .then((d: Quote) => { setQuote(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveImage = async () => {
    if (!cardRef.current || !quote) return;
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: true,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png", 1.0);
      });

      const dateStr = new Date().toLocaleDateString("zh-TW").replace(/\//g, "");
      const filename = `TOBE正能量_${dateStr}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      if (mobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "TOBE 每日正能量" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-violet-50/30 flex flex-col items-center justify-center p-6 gap-5">

      {/* ── The shareable card (captured area) ── */}
      <div ref={cardRef} className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-none"
        style={{ fontFamily: "'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif" }}>

        {/* Top accent bar */}
        <div style={{ height: 6, background: "linear-gradient(90deg, #7c3aed, #a855f7, #6366f1)" }} />

        <div style={{ padding: "32px 32px 0" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 20 }}>✨</span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 900, color: "#7c3aed", letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>
                每天一句正能量
              </p>
              <p style={{ fontSize: 9, color: "#94a3b8", marginTop: 2, letterSpacing: "0.05em", margin: "2px 0 0" }}>
                {today}
              </p>
            </div>
          </div>

          {/* Top divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #ddd6fe, transparent)" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c4b5fd" }} />
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #ddd6fe, transparent)" }} />
          </div>

          {/* Quote marks + text */}
          {loading ? (
            <div style={{ marginBottom: 24 }}>
              <div style={{ height: 20, background: "#f1f5f9", borderRadius: 8, marginBottom: 8 }} />
              <div style={{ height: 20, background: "#f1f5f9", borderRadius: 8, width: "80%", marginBottom: 8 }} />
              <div style={{ height: 20, background: "#f1f5f9", borderRadius: 8, width: "60%" }} />
            </div>
          ) : quote ? (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 40, color: "rgba(196,181,253,0.6)", lineHeight: 1, marginBottom: 8, fontFamily: "Georgia, serif" }}>"</div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", lineHeight: 1.65, letterSpacing: "0.04em", textAlign: "center", margin: "0 0 8px" }}>
                {quote.text}
              </p>
              <div style={{ fontSize: 40, color: "rgba(196,181,253,0.6)", lineHeight: 1, textAlign: "right", fontFamily: "Georgia, serif" }}>"</div>
            </div>
          ) : null}

          {/* Bottom divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #fde68a, transparent)" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#fcd34d" }} />
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #fde68a, transparent)" }} />
          </div>

          {/* Author + Sender */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 28 }}>
            <div>
              <p style={{ fontSize: 9, color: "#94a3b8", margin: "0 0 2px" }}>主題分類</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", margin: 0 }}>— {quote?.author ?? ""}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 9, color: "#94a3b8", margin: "0 0 2px" }}>由此傳達給您</p>
              <p style={{ fontSize: 14, fontWeight: 900, color: "#7c3aed", margin: 0 }}>{senderName}</p>
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <div style={{
          background: "linear-gradient(90deg, #f5f3ff, #eef2ff)",
          borderTop: "1px solid rgba(221,214,254,0.5)",
          padding: "10px 32px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
            TOBE NEXUS · AI房仲系統 | 每日正能量
          </p>
        </div>
      </div>

      {/* ── Save/share button (NOT captured) ── */}
      <button
        onClick={handleSaveImage}
        disabled={saving || loading || !quote}
        className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-200 shadow-lg
          ${saved
            ? "bg-emerald-500 text-white shadow-emerald-200"
            : saving
              ? "bg-violet-300 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 active:scale-95 shadow-violet-200"
          }`}
      >
        {saved ? (
          <><CheckCircle2 className="w-5 h-5" /> 圖片已儲存！</>
        ) : saving ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> 生成圖片中...</>
        ) : (
          <><ImageDown className="w-5 h-5" /> 儲存圖片 · 分享給朋友</>
        )}
      </button>

      <p className="text-[10px] text-slate-400 text-center max-w-xs leading-relaxed">
        {isMobile
          ? "手機可直接透過系統分享傳到 LINE、IG、FB 等平台 ✨"
          : "圖片已下載到電腦，開啟 LINE 後手動傳送給朋友即可 ✨"}
      </p>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    }>
      <QuoteCard />
    </Suspense>
  );
}
