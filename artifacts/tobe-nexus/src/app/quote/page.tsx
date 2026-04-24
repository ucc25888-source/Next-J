"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ImageDown, Loader2, CheckCircle2 } from "lucide-react";

interface Quote { text: string; author: string; date: string; }

/* 書寫感 - 明體系字型堆疊（各平台最接近毛筆手寫的清晰字體） */
const SERIF = `"Noto Serif TC", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "Yu Mincho", "YuMincho", "PMingLiU", "MingLiU", "STSong", Georgia, serif`;

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

    /* 載入 Noto Serif TC — 讓截圖字體更漂亮 */
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&display=swap";
    document.head.appendChild(link);

    fetch("/api/daily-quote")
      .then(r => r.json())
      .then((d: Quote) => { setQuote(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveImage = async () => {
    if (!captureRef.current || !quote) return;
    setSaving(true);
    try {
      /* 等字體載入完再截圖 */
      await document.fonts.ready;
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8"
      style={{ background: "linear-gradient(135deg, #0f0524 0%, #1a0533 40%, #0d0a1f 100%)" }}>

      {/* ══ CAPTURE AREA ══ */}
      <div
        ref={captureRef}
        style={{
          width: 380,
          background: "linear-gradient(160deg, #130a2e 0%, #1e0b40 30%, #2d0f5c 60%, #1a0838 100%)",
          borderRadius: 32,
          padding: "40px 26px 32px",
          fontFamily: SERIF,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background atmosphere */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(139,92,246,0.32) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle at 60% 60%, rgba(168,85,247,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        <div style={{ position: "absolute", top: 0, left: "15%", width: "70%", height: 2, background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.35), transparent)", pointerEvents: "none" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26, position: "relative" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.5), 0 0 0 1px rgba(167,139,250,0.18)", flexShrink: 0, fontSize: 18 }}>✨</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(216,180,254,0.9)", letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, fontFamily: "'PingFang TC','Noto Sans TC',sans-serif" }}>每天一句正能量</p>
            <p style={{ fontSize: 9, color: "rgba(167,139,250,0.5)", margin: "3px 0 0", fontFamily: "'PingFang TC','Noto Sans TC',sans-serif" }}>{today}</p>
          </div>
        </div>

        {/* ── White card with 3-D floating shadows ── */}
        <div style={{ position: "relative" }}>
          {/* Glow bloom behind card */}
          <div style={{ position: "absolute", bottom: -18, left: "8%", width: "84%", height: 55, background: "rgba(124,58,237,0.52)", filter: "blur(26px)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -30, left: "4%", width: "92%", height: 36, background: "rgba(168,85,247,0.22)", filter: "blur(38px)", borderRadius: "50%", pointerEvents: "none" }} />

          <div style={{
            background: "#fffef9",   /* 微微暖白，像信紙 */
            borderRadius: 20,
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 0 0 1px rgba(139,92,246,0.14), 0 2px 4px rgba(0,0,0,0.28), 0 8px 16px rgba(0,0,0,0.32), 0 22px 44px rgba(0,0,0,0.38), 0 44px 88px rgba(0,0,0,0.3)",
          }}>
            {/* Top accent bar */}
            <div style={{ height: 5, background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 40%, #818cf8 70%, #6366f1 100%)" }} />

            <div style={{ padding: "28px 32px 26px" }}>

              {/* Top ornament line */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #ddd6fe, transparent)" }} />
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#c4b5fd,#a78bfa)" }} />
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #ddd6fe, transparent)" }} />
              </div>

              {/* Quote block */}
              {loading ? (
                <div style={{ marginBottom: 24 }}>
                  {[100, 85, 70].map((w, i) => (
                    <div key={i} style={{ height: 18, background: "#f1f0eb", borderRadius: 4, marginBottom: 8, width: `${w}%` }} />
                  ))}
                </div>
              ) : quote ? (
                <div style={{ marginBottom: 8 }}>
                  {/* Opening quote mark */}
                  <div style={{ fontSize: 42, color: "rgba(196,181,253,0.4)", lineHeight: 1, fontFamily: "Georgia, serif", marginBottom: 2 }}>"</div>

                  {/* Quote text — 書信明體 */}
                  <p style={{
                    fontSize: 19,
                    fontWeight: 600,
                    color: "#1a1a2e",
                    lineHeight: 1.9,
                    letterSpacing: "0.06em",
                    textAlign: "justify",
                    margin: "0 0 16px",
                    fontFamily: SERIF,
                  }}>
                    {quote.text}
                  </p>

                  {/* Signature — 直接跟在句子右下方，像親筆簽名 */}
                  <p style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#5b21b6",
                    textAlign: "right",
                    margin: "0 0 10px",
                    letterSpacing: "0.05em",
                    fontFamily: SERIF,
                  }}>
                    — {senderName}
                  </p>

                  {/* Closing quote mark */}
                  <div style={{ fontSize: 42, color: "rgba(196,181,253,0.4)", lineHeight: 1, textAlign: "right", fontFamily: "Georgia, serif", marginTop: -4 }}>"</div>
                </div>
              ) : null}

              {/* Bottom ornament line */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #fde68a, transparent)" }} />
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#fbbf24" }} />
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #fde68a, transparent)" }} />
              </div>
            </div>

            {/* Card footer */}
            <div style={{ background: "linear-gradient(90deg, #f5f3ff, #eef2ff, #f5f3ff)", borderTop: "1px solid rgba(221,214,254,0.55)", padding: "9px 32px", textAlign: "center" }}>
              <p style={{ fontSize: 9, color: "#a5b4c3", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0, fontWeight: 600, fontFamily: "'PingFang TC','Noto Sans TC',sans-serif" }}>
                TOBE NEXUS · AI房仲系統 | 每日正能量
              </p>
            </div>
          </div>
        </div>

        {/* Caption pill */}
        <div style={{ marginTop: 26, textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(167,139,250,0.18)" }}>
            <span style={{ fontSize: 8, color: "rgba(196,181,253,0.65)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, fontFamily: "'PingFang TC','Noto Sans TC',sans-serif" }}>
              花蓮房產顧問 · 每天一句 陪你前進
            </span>
          </div>
        </div>
      </div>
      {/* ══ END CAPTURE AREA ══ */}

      {/* Save / share button */}
      <button
        onClick={handleSaveImage}
        disabled={saving || loading || !quote}
        className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-200
          ${saved ? "bg-emerald-500 text-white" : saving ? "bg-violet-500/60 text-white cursor-not-allowed" : "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-400 hover:to-purple-500 active:scale-95"}`}
        style={{ boxShadow: saved ? "0 8px 24px rgba(16,185,129,0.4)" : "0 8px 32px rgba(124,58,237,0.5)" }}
      >
        {saved ? <><CheckCircle2 className="w-5 h-5" /> 圖片已儲存！</>
          : saving ? <><Loader2 className="w-5 h-5 animate-spin" /> 生成圖片中...</>
            : <><ImageDown className="w-5 h-5" /> 儲存圖片 · 分享給朋友</>}
      </button>

      <p style={{ fontSize: 11, color: "rgba(167,139,250,0.4)", textAlign: "center", maxWidth: 280, lineHeight: 1.6, margin: 0 }}>
        {isMobile ? "手機可直接透過系統分享傳到 LINE、IG、FB ✨" : "圖片下載後，開啟 LINE 手動傳送給朋友即可 ✨"}
      </p>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0f0524", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="w-6 h-6 border-2 border-violet-400 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <QuoteCard />
    </Suspense>
  );
}
