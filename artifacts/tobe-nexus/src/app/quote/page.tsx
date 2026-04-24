"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ImageDown, Loader2, CheckCircle2 } from "lucide-react";

interface Quote { text: string; author: string; date: string; }

const FONT = "'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";

function QuoteCard() {
  const params = useSearchParams();
  const senderName = params.get("name") ?? "花蓮房產顧問福哥";

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("zh-TW", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
    fetch("/api/daily-quote")
      .then(r => r.json())
      .then((d: Quote) => { setQuote(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveImage = async () => {
    if (!captureRef.current || !quote) return;
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(captureRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-purple-950 flex flex-col items-center justify-center p-6 gap-6">

      {/* ══ CAPTURE AREA — this entire div becomes the shared image ══ */}
      <div
        ref={captureRef}
        style={{
          width: 360,
          background: "linear-gradient(150deg, #1e0a3c 0%, #3b0764 35%, #5b21b6 75%, #4c1d95 100%)",
          borderRadius: 28,
          padding: "32px 24px 24px",
          fontFamily: FONT,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative blobs */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 180, height: 180, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: 60, left: -30,
          width: 140, height: 140, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,181,253,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* Subtle dot pattern */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />

        {/* Top label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, position: "relative" }}>
          <span style={{ fontSize: 18 }}>✨</span>
          <div>
            <p style={{ fontSize: 10, fontWeight: 900, color: "rgba(216,180,254,0.9)", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
              每天一句正能量
            </p>
            <p style={{ fontSize: 9, color: "rgba(196,181,253,0.5)", marginTop: 2, margin: "2px 0 0" }}>
              {today}
            </p>
          </div>
        </div>

        {/* ── White card ── */}
        <div style={{
          background: "#ffffff",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25)",
          position: "relative",
        }}>
          {/* Top accent bar */}
          <div style={{ height: 5, background: "linear-gradient(90deg, #7c3aed, #a855f7, #6366f1)" }} />

          <div style={{ padding: "24px 28px 0" }}>
            {/* Top divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #ddd6fe, transparent)" }} />
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#c4b5fd" }} />
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #ddd6fe, transparent)" }} />
            </div>

            {/* Quote */}
            {loading ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ height: 18, background: "#f1f5f9", borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 18, background: "#f1f5f9", borderRadius: 6, width: "80%", marginBottom: 8 }} />
                <div style={{ height: 18, background: "#f1f5f9", borderRadius: 6, width: "60%" }} />
              </div>
            ) : quote ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 36, color: "rgba(196,181,253,0.5)", lineHeight: 1, marginBottom: 6, fontFamily: "Georgia, serif" }}>"</div>
                <p style={{
                  fontSize: 19, fontWeight: 700, color: "#1e293b",
                  lineHeight: 1.7, letterSpacing: "0.04em",
                  textAlign: "center", margin: "0 0 6px",
                }}>
                  {quote.text}
                </p>
                <div style={{ fontSize: 36, color: "rgba(196,181,253,0.5)", lineHeight: 1, textAlign: "right", fontFamily: "Georgia, serif" }}>"</div>
              </div>
            ) : null}

            {/* Bottom divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #fde68a, transparent)" }} />
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#fcd34d" }} />
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #fde68a, transparent)" }} />
            </div>

            {/* Author + Sender */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 22 }}>
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

          {/* Card bottom branding strip */}
          <div style={{
            background: "linear-gradient(90deg, #f5f3ff, #eef2ff)",
            borderTop: "1px solid rgba(221,214,254,0.5)",
            padding: "8px 28px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
              TOBE NEXUS · AI房仲系統 | 每日正能量
            </p>
          </div>
        </div>

        {/* Caption below card, inside gradient background */}
        <div style={{ marginTop: 18, textAlign: "center", position: "relative" }}>
          <p style={{ fontSize: 10, color: "rgba(196,181,253,0.55)", letterSpacing: "0.08em", margin: 0 }}>
            花蓮房產顧問 · 每天一句，陪你前進
          </p>
        </div>
      </div>
      {/* ══ END CAPTURE AREA ══ */}

      {/* Save / share button — NOT captured */}
      <button
        onClick={handleSaveImage}
        disabled={saving || loading || !quote}
        className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-200 shadow-lg
          ${saved
            ? "bg-emerald-500 text-white shadow-emerald-900/30"
            : saving
              ? "bg-violet-400 text-white cursor-not-allowed"
              : "bg-white text-violet-700 hover:bg-violet-50 active:scale-95 shadow-black/30"
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

      <p className="text-[10px] text-violet-300/50 text-center max-w-xs leading-relaxed">
        {isMobile
          ? "手機可直接透過系統分享傳到 LINE、IG、FB ✨"
          : "圖片下載後，開啟 LINE 手動傳送給朋友即可 ✨"}
      </p>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-violet-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-400 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <QuoteCard />
    </Suspense>
  );
}
