"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Quote { text: string; author: string; date: string; }

function QuoteCard() {
  const params = useSearchParams();
  const senderName = params.get("name") ?? "花蓮房產顧問福哥";

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/daily-quote")
      .then(r => r.json())
      .then((d: Quote) => { setQuote(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/40 flex items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-violet-100/40 to-indigo-100/30 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-100/40 to-orange-100/20 blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-rose-100/20 to-pink-100/10 blur-2xl -translate-x-1/2 -translate-y-1/2" />

        {/* Corner ornaments */}
        <svg className="absolute top-6 left-6 w-20 h-20 text-violet-200/60" viewBox="0 0 80 80" fill="none">
          <circle cx="8" cy="8" r="3" fill="currentColor"/>
          <circle cx="24" cy="8" r="2" fill="currentColor" opacity="0.6"/>
          <circle cx="8" cy="24" r="2" fill="currentColor" opacity="0.6"/>
          <circle cx="40" cy="8" r="1.5" fill="currentColor" opacity="0.3"/>
          <circle cx="8" cy="40" r="1.5" fill="currentColor" opacity="0.3"/>
          <path d="M2 2 Q20 2 20 20" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
        </svg>
        <svg className="absolute bottom-6 right-6 w-20 h-20 text-amber-300/60" viewBox="0 0 80 80" fill="none">
          <circle cx="72" cy="72" r="3" fill="currentColor"/>
          <circle cx="56" cy="72" r="2" fill="currentColor" opacity="0.6"/>
          <circle cx="72" cy="56" r="2" fill="currentColor" opacity="0.6"/>
          <circle cx="40" cy="72" r="1.5" fill="currentColor" opacity="0.3"/>
          <circle cx="72" cy="40" r="1.5" fill="currentColor" opacity="0.3"/>
          <path d="M78 78 Q60 78 60 60" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
        </svg>

        {/* Subtle diagonal lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" preserveAspectRatio="none">
          <defs>
            <pattern id="lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M-10 10 l20-20 M0 40 l40-40 M30 50 l20-20" stroke="#7c3aed" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lines)"/>
        </svg>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-sm">
        {/* Card shadow layer */}
        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-3xl bg-gradient-to-br from-violet-200/40 to-amber-200/40 blur-sm" />

        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl border border-white/80 shadow-2xl shadow-violet-900/10 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400" />

          <div className="px-8 pt-8 pb-7">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg">✨</span>
              <div>
                <p className="text-[11px] font-black text-violet-600 tracking-[0.2em] uppercase">每天一句正能量</p>
                <p className="text-[9px] text-slate-400 mt-0.5 tracking-wide">{today}</p>
              </div>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
              <div className="w-1.5 h-1.5 rounded-full bg-violet-300" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
            </div>

            {/* Quote */}
            {loading ? (
              <div className="space-y-2 mb-6">
                <div className="h-5 bg-slate-100 rounded-lg animate-pulse w-full" />
                <div className="h-5 bg-slate-100 rounded-lg animate-pulse w-4/5" />
                <div className="h-5 bg-slate-100 rounded-lg animate-pulse w-3/5" />
              </div>
            ) : quote ? (
              <div className="mb-6">
                <div className="text-4xl text-violet-200/70 font-serif leading-none mb-2 select-none">"</div>
                <p className="text-[19px] font-bold text-slate-800 leading-[1.65] tracking-wide text-center">
                  {quote.text}
                </p>
                <div className="text-4xl text-violet-200/70 font-serif leading-none text-right select-none mt-1">"</div>
              </div>
            ) : null}

            {/* Decorative divider */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
              <div className="w-1 h-1 rounded-full bg-amber-300" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
            </div>

            {/* Author + Sender */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] text-slate-400 mb-0.5">主題分類</p>
                <p className="text-[11px] font-bold text-slate-500">— {quote?.author ?? ""}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 mb-0.5">由此傳達給您</p>
                <p className="text-[13px] font-black text-violet-600">{senderName}</p>
              </div>
            </div>
          </div>

          {/* Bottom branding */}
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-t border-violet-100/60 px-8 py-3">
            <p className="text-[9px] text-slate-400 text-center tracking-widest uppercase">
              TOBE · 花蓮房產顧問 · 每日正能量
            </p>
          </div>
        </div>
      </div>
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
