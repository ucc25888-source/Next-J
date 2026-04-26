"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ImageDown, Loader2, CheckCircle2 } from "lucide-react";

interface Quote { text: string; author: string; date: string; }

const SERIF  = `"Noto Serif TC","Hiragino Mincho ProN","Hiragino Mincho Pro","Yu Mincho","PMingLiU","STSong",Georgia,serif`;
const SANS   = `"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif`;

function QuoteCard() {
  const params      = useSearchParams();
  const senderName  = params.get("name") ?? "花蓮房產顧問福哥";

  const [quote,    setQuote]    = useState<Quote | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("zh-TW", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&display=swap";
    document.head.appendChild(link);
    fetch("/api/daily-quote")
      .then(r => r.json())
      .then((d: Quote) => { setQuote(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleForceRefresh = async () => {
    setLoading(true);
    setQuote(null);
    try {
      const d = await fetch("/api/daily-quote?force=true").then(r => r.json()) as Quote;
      setQuote(d);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleSaveImage = async () => {
    if (!captureRef.current || !quote) return;
    setSaving(true);
    try {
      await document.fonts.ready;
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(captureRef.current, {
        scale: 2.5, useCORS: true, backgroundColor: null,
        logging: false, removeContainer: true,
      });
      const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), "image/png", 1.0));
      const dateStr  = new Date().toLocaleDateString("zh-TW").replace(/\//g, "");
      const filename = `TOBE正能量_${dateStr}.png`;
      const file     = new File([blob], filename, { type: "image/png" });
      const mobile   = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      if (mobile && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "TOBE 每日正能量" });
      } else {
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), { href: url, download: filename }).click();
        URL.revokeObjectURL(url);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  /* ─── colour tokens ─── */
  const BG_OUTER  = "linear-gradient(150deg,#0c0520 0%,#160835 35%,#210c50 65%,#0e0528 100%)";
  const BG_CARD   = "#fdfcf5";          /* warm cream — 信紙色 */
  const ACCENT    = "#6d28d9";
  const ACCENT_LT = "rgba(167,139,250,0.35)";
  const INK       = "#1c1230";          /* 深墨色文字 */
  const RULE_CLR  = "rgba(167,139,250,0.07)"; /* 橫線顏色 */

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 gap-7"
      style={{ background: BG_OUTER }}>

      {/* ══════════ CAPTURE AREA ══════════ */}
      <div ref={captureRef} style={{
        width: 390,
        background: "linear-gradient(155deg,#140730 0%,#220c4a 30%,#341266 60%,#1a0a3a 100%)",
        borderRadius: 30,
        padding: "38px 26px 30px",
        fontFamily: SERIF,
        position: "relative",
        overflow: "hidden",
      }}>

        {/* ── Outer background atmosphere ── */}
        {/* Top-right orb */}
        <div style={{ position:"absolute", top:-80, right:-70, width:260, height:260, borderRadius:"50%",
          background:"radial-gradient(circle at 35% 35%, rgba(139,92,246,0.30) 0%, transparent 65%)",
          pointerEvents:"none" }} />
        {/* Bottom-left orb */}
        <div style={{ position:"absolute", bottom:-50, left:-50, width:200, height:200, borderRadius:"50%",
          background:"radial-gradient(circle at 65% 65%, rgba(168,85,247,0.18) 0%, transparent 70%)",
          pointerEvents:"none" }} />
        {/* Dot grid */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize:"20px 20px" }} />
        {/* Top shimmer line */}
        <div style={{ position:"absolute", top:0, left:"10%", width:"80%", height:1.5,
          background:"linear-gradient(90deg, transparent, rgba(196,181,253,0.45), transparent)",
          pointerEvents:"none" }} />

        {/* ── Header (outside white card) ── */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24, position:"relative" }}>
          {/* Icon badge */}
          <div style={{ width:38, height:38, borderRadius:11, flexShrink:0, fontSize:19,
            background:"linear-gradient(135deg,#7c3aed,#a855f7)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 0 1px rgba(167,139,250,0.25), 0 6px 16px rgba(109,40,217,0.55)" }}>✨</div>
          <div>
            <p style={{ margin:0, fontSize:11, fontWeight:700, letterSpacing:"0.2em",
              textTransform:"uppercase", color:"rgba(216,180,254,0.92)", fontFamily:SANS }}>
              每天一句正能量</p>
            <p style={{ margin:"3px 0 0", fontSize:9, color:"rgba(167,139,250,0.48)", fontFamily:SANS }}>
              {today}</p>
          </div>
        </div>

        {/* ── White card + multi-layer 3-D shadow ── */}
        <div style={{ position:"relative" }}>
          {/* Glow bloom 1 — tight, bright */}
          <div style={{ position:"absolute", bottom:-14, left:"12%", width:"76%", height:52,
            background:"rgba(109,40,217,0.6)", filter:"blur(22px)", borderRadius:"50%", pointerEvents:"none" }} />
          {/* Glow bloom 2 — wide, diffuse */}
          <div style={{ position:"absolute", bottom:-30, left:"4%", width:"92%", height:40,
            background:"rgba(168,85,247,0.22)", filter:"blur(42px)", borderRadius:"50%", pointerEvents:"none" }} />
          {/* Shadow card (offset clone) for extra depth */}
          <div style={{ position:"absolute", inset:0, borderRadius:22,
            background:"rgba(30,5,60,0.55)", transform:"translate(6px,8px)", filter:"blur(12px)", pointerEvents:"none" }} />

          {/* ══ THE WHITE CARD ══ */}
          <div style={{
            background: BG_CARD,
            borderRadius: 22,
            overflow: "hidden",
            position: "relative",
            boxShadow: [
              "0 0 0 1px rgba(139,92,246,0.18)",
              "0 1px 2px rgba(0,0,0,0.25)",
              "0 4px 10px rgba(0,0,0,0.30)",
              "0 14px 28px rgba(0,0,0,0.35)",
              "0 32px 64px rgba(0,0,0,0.30)",
            ].join(", "),
          }}>

            {/* Chromatic top bar */}
            <div style={{ height:5, background:"linear-gradient(90deg,#4f46e5,#7c3aed,#a855f7,#818cf8,#6366f1)" }} />

            {/* Paper lined texture inside card */}
            <div style={{ position:"absolute", inset:0, top:5, pointerEvents:"none",
              backgroundImage:`repeating-linear-gradient(to bottom,transparent,transparent 28px,${RULE_CLR} 28px,${RULE_CLR} 29px)`,
              backgroundPosition:"0 16px" }} />

            {/* Inner content frame */}
            <div style={{ padding:"26px 28px 0", position:"relative" }}>

              {/* Decorative inner border frame */}
              <div style={{ border:"1px solid rgba(196,181,253,0.22)", borderRadius:12, padding:"22px 20px 20px", position:"relative",
                background:"linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(253,252,245,0.3))" }}>

                {/* Corner ornament TL */}
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ position:"absolute", top:-1, left:-1 }}>
                  <path d="M1 8 V1 H8" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {/* Corner ornament TR */}
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ position:"absolute", top:-1, right:-1 }}>
                  <path d="M13 8 V1 H6" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {/* Corner ornament BL */}
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ position:"absolute", bottom:-1, left:-1 }}>
                  <path d="M1 6 V13 H8" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {/* Corner ornament BR */}
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ position:"absolute", bottom:-1, right:-1 }}>
                  <path d="M13 6 V13 H6" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>

                {/* Quote body */}
                {loading ? (
                  <div>
                    {[100,82,65].map((w,i)=>(
                      <div key={i} style={{ height:17, background:"rgba(196,181,253,0.15)", borderRadius:4, marginBottom:9, width:`${w}%` }} />
                    ))}
                  </div>
                ) : quote ? (
                  <div>
                    {/* Opening mark */}
                    <div style={{ fontSize:44, lineHeight:1, color:"rgba(167,139,250,0.3)", fontFamily:"Georgia,serif", marginBottom:-6 }}>"</div>

                    {/* Quote text */}
                    <p style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: INK,
                      lineHeight: 2.0,
                      letterSpacing: "0.07em",
                      textAlign: "justify",
                      margin: "0 0 14px",
                      fontFamily: SERIF,
                    }}>
                      {quote.text}
                    </p>

                    {/* Signature — inline after quote */}
                    <p style={{
                      textAlign: "right",
                      margin: "0 0 4px",
                      fontFamily: SERIF,
                      fontSize: 14,
                      fontWeight: 600,
                      color: ACCENT,
                      letterSpacing: "0.06em",
                    }}>
                      — {senderName}
                    </p>

                    {/* Closing mark */}
                    <div style={{ fontSize:44, lineHeight:1, color:"rgba(167,139,250,0.3)", fontFamily:"Georgia,serif", textAlign:"right", marginTop:-6 }}>"</div>
                  </div>
                ) : null}
              </div>

              {/* Amber bottom rule */}
              <div style={{ display:"flex", alignItems:"center", gap:8, margin:"18px 0 0" }}>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(251,191,36,0.45),transparent)" }} />
                <div style={{ width:4, height:4, borderRadius:"50%", background:"#fbbf24", boxShadow:"0 0 6px rgba(251,191,36,0.6)" }} />
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(251,191,36,0.45),transparent)" }} />
              </div>

              {/* Space before footer */}
              <div style={{ height:18 }} />
            </div>

            {/* Card footer */}
            <div style={{ background:"linear-gradient(90deg,#f0ebff,#eef2ff,#f0ebff)", borderTop:"1px solid rgba(196,181,253,0.4)", padding:"8px 28px", textAlign:"center" }}>
              <p style={{ fontSize:9, color:"#9fa8c0", letterSpacing:"0.15em", textTransform:"uppercase", margin:0, fontFamily:SANS, fontWeight:600 }}>
                TOBE NEXUS · AI房仲系統 | 每日正能量
              </p>
            </div>
          </div>
        </div>

        {/* Caption pill */}
        <div style={{ marginTop:24, textAlign:"center", position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", padding:"5px 16px", borderRadius:20,
            background:"rgba(109,40,217,0.14)", border:"1px solid rgba(167,139,250,0.2)" }}>
            <span style={{ fontSize:8.5, color:"rgba(196,181,253,0.6)", letterSpacing:"0.12em",
              textTransform:"uppercase", fontWeight:700, fontFamily:SANS }}>
              花蓮房產顧問 · 每天一句 陪你前進
            </span>
          </div>
        </div>
      </div>
      {/* ══════════ END CAPTURE ══════════ */}

      {/* Save button */}
      <button
        onClick={handleSaveImage}
        disabled={saving || loading || !quote}
        style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"14px 36px", borderRadius:18, border:"none",
          fontSize:14, fontWeight:900, cursor: saving||loading||!quote ? "not-allowed" : "pointer",
          fontFamily: SANS,
          background: saved
            ? "linear-gradient(135deg,#059669,#10b981)"
            : saving
              ? "rgba(109,40,217,0.4)"
              : "linear-gradient(135deg,#7c3aed,#a855f7)",
          color: "#fff",
          boxShadow: saved
            ? "0 8px 24px rgba(5,150,105,0.45)"
            : saving ? "none"
              : "0 8px 28px rgba(109,40,217,0.55), 0 2px 8px rgba(0,0,0,0.3)",
          transition: "all 0.2s",
        }}>
        {saved   ? <><CheckCircle2 style={{width:20,height:20}} /> 圖片已儲存！</>
        : saving ? <><Loader2 style={{width:20,height:20,animation:"spin 0.8s linear infinite"}} /> 生成圖片中...</>
                 : <><ImageDown style={{width:20,height:20}} /> 儲存圖片 · 分享給朋友</>}
      </button>

      <p style={{ fontSize:11, color:"rgba(167,139,250,0.38)", textAlign:"center", maxWidth:280, lineHeight:1.7, margin:0, fontFamily:SANS }}>
        {isMobile ? "手機可直接透過系統分享傳到 LINE、IG、FB ✨" : "圖片下載後，開啟 LINE 手動傳送給朋友即可 ✨"}
      </p>

      {/* Admin: force regenerate */}
      <button
        onClick={handleForceRefresh}
        disabled={loading}
        style={{
          background:"none", border:"none", cursor: loading ? "not-allowed" : "pointer",
          fontSize:10, color:"rgba(167,139,250,0.28)", fontFamily:SANS,
          letterSpacing:"0.08em", padding:"4px 8px", marginTop:-4,
          textDecoration:"underline", textUnderlineOffset:3,
        }}>
        {loading ? "生成中…" : "🔄 重新生成今日話語"}
      </button>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:"100vh", background:"#0c0520", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:24, height:24, border:"2.5px solid rgba(167,139,250,0.3)", borderTopColor:"#a78bfa", borderRadius:"50%" }} />
      </div>
    }>
      <QuoteCard />
    </Suspense>
  );
}
