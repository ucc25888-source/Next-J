"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useSystemStore } from "@/store/useSystemStore";
import PageHeader from "@/components/PageHeader";
import {
  Building2, ChevronRight, Plus,
  AlertCircle, CheckCircle2, Bell, MoveRight,
  CalendarCheck, Smile, Meh, ThumbsDown, Star,
} from "lucide-react";
import type { DailyFocusItem } from "@/types";

interface ShowingReaction { reaction: string; cnt: number; }

const STATUS_STYLE: Record<string, string> = {
  "銷售中":  "bg-emerald-100 text-emerald-700",
  "議價中":  "bg-sky-100 text-sky-700",
  "洽談中":  "bg-sky-100 text-sky-700",
  "已成交":  "bg-slate-100 text-slate-500",
  "暫停銷售": "bg-orange-100 text-orange-700",
};

export default function DashboardPage() {
  const properties = usePropertyStore((s) => s.properties);
  const copies = useSystemStore((s) => s.copies);
  const currentClient = useSystemStore((s) => s.currentClient);

  const [focusItems, setFocusItems] = useState<DailyFocusItem[]>([]);
  const [focusLoading, setFocusLoading] = useState(true);
  const [showingReactions, setShowingReactions] = useState<ShowingReaction[]>([]);
  const [showingTotal, setShowingTotal] = useState(0);

  const loadFocus = useCallback(async () => {
    setFocusLoading(true);
    try {
      const res = await fetch(`/api/daily-focus?_t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setFocusItems(d.items ?? []);
      }
    } finally { setFocusLoading(false); }
  }, []);

  useEffect(() => { loadFocus(); }, [loadFocus]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") loadFocus(); };
    const onFocus   = () => loadFocus();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadFocus]);

  useEffect(() => {
    fetch("/api/showings/stats", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(d => {
      if (!d) return;
      setShowingReactions(d.reactions ?? []);
      const total = (d.reactions ?? []).reduce((s: number, r: ShowingReaction) => s + r.cnt, 0);
      setShowingTotal(total);
    });
  }, []);

  const activeListings    = properties.filter((p) => p.status_now === "銷售中").length;
  const negotiatingCount  = properties.filter((p) => p.status_now === "議價中" || p.status_now === "洽談中").length;

  const overdueCount  = focusItems.filter((i) => i.is_overdue && !i.done && i.type !== "property").length;
  const todayCount    = focusItems.filter((i) => !i.is_overdue && !i.done && i.type !== "property").length;
  const alertCount    = focusItems.filter((i) => i.type === "property").length;
  const totalPending  = overdueCount + todayCount;

  const statCards = [
    {
      label: "委託案件", value: properties.length, sub: "件", emoji: "🏘️",
      badge: "總管理", badgeStyle: "bg-amber-100 text-amber-600",
      gradient: "from-amber-50 to-orange-100", border: "border-amber-200/80",
      numColor: "text-amber-600", labelColor: "text-amber-800", ringColor: "bg-amber-400/20",
      hint: properties.length > 0 ? `銷售中 ${activeListings} 件` : "開始登錄案件",
      hintColor: "text-amber-500",
    },
    {
      label: "熱銷中案件", value: activeListings, sub: "件", emoji: "🔥",
      badge: "LIVE", badgeStyle: "bg-emerald-100 text-emerald-600",
      gradient: "from-emerald-50 to-green-100", border: "border-emerald-200/80",
      numColor: "text-emerald-600", labelColor: "text-emerald-800", ringColor: "bg-emerald-400/20",
      hint: activeListings > 0 ? "買方都在找！" : "把案件狀態設為銷售中",
      hintColor: "text-emerald-500",
    },
    {
      label: "議價∕洽談中", value: negotiatingCount, sub: "件", emoji: "💬",
      badge: "成交在即", badgeStyle: "bg-sky-100 text-sky-600",
      gradient: "from-sky-50 to-blue-100", border: "border-sky-200/80",
      numColor: "text-sky-600", labelColor: "text-sky-800", ringColor: "bg-sky-400/20",
      hint: negotiatingCount > 0 ? "把握機會，加把勁！" : "持續跟進，等待時機",
      hintColor: "text-sky-500",
    },
    {
      label: "AI 文案生成", value: currentClient?.used_this_month ?? 0, sub: "次", emoji: "⚡",
      badge: "本月", badgeStyle: "bg-violet-100 text-violet-600",
      gradient: "from-violet-50 to-purple-100", border: "border-violet-200/80",
      numColor: "text-violet-600", labelColor: "text-violet-800", ringColor: "bg-violet-400/20",
      hint: `配額 ${currentClient?.monthly_quota ?? 0} 次`,
      hintColor: "text-violet-500",
    },
  ];

  const getTitle = (p: ReturnType<typeof usePropertyStore.getState>["properties"][0]) =>
    `${p.listing_id ? `[${p.listing_id}] ` : ""}${p.subarea} ${p.property_type}`;

  const reactionConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    "很有興趣": { icon: <Star className="w-3.5 h-3.5" />, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    "有點興趣": { icon: <Smile className="w-3.5 h-3.5" />, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    "普通":     { icon: <Meh className="w-3.5 h-3.5" />, color: "text-slate-500", bg: "bg-slate-50 border-slate-200" },
    "否定":     { icon: <ThumbsDown className="w-3.5 h-3.5" />, color: "text-red-500", bg: "bg-red-50 border-red-200" },
  };

  void copies;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="TOBE Nexus AI"
        subtitle="甩開燒腦負累，活成妳喜歡的樣子"
        actions={
          <Link href="/properties/new"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm">
            <Plus className="w-3.5 h-3.5" /> 新增案件
          </Link>
        }
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-5 lg:space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label}
              className={`relative bg-gradient-to-br ${card.gradient} rounded-2xl p-5 border ${card.border} overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md group cursor-default`}>
              <div className={`absolute -top-5 -right-5 w-24 h-24 rounded-full ${card.ringColor} transition-transform duration-500 group-hover:scale-110`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl leading-none">{card.emoji}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${card.badgeStyle} tracking-wider uppercase whitespace-nowrap`}>
                    {card.badge}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-[2.6rem] font-black leading-none ${card.numColor} tabular-nums`}>{card.value}</span>
                  <span className={`text-base font-bold ${card.numColor} opacity-70`}>{card.sub}</span>
                </div>
                <p className={`mt-1 text-[13px] font-bold ${card.labelColor}`}>{card.label}</p>
                <p className={`mt-1.5 text-[10px] font-semibold ${card.hintColor} opacity-80`}>{card.hint}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── 每日重點 (大卡片) ── */}
        <Link href="/daily-focus"
          className={`block rounded-2xl border shadow-sm transition-all group hover:shadow-md hover:-translate-y-0.5
            ${totalPending > 0
              ? "bg-white border-slate-200 border-l-4 border-l-blue-400"
              : "bg-white border-slate-200 border-l-4 border-l-emerald-400"}`}>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${totalPending > 0 ? "bg-blue-100" : "bg-emerald-100"}`}>
                <Bell className={`w-5 h-5 ${totalPending > 0 ? "text-blue-600" : "text-emerald-600"}`} />
              </div>
              <div>
                <p className="text-base font-black text-slate-800 tracking-tight">每日重點</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {focusLoading ? "載入中…" : totalPending === 0 && alertCount === 0 ? "今日任務全部清零 🎉" : "點擊查看今日待辦清單"}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 font-bold text-xs shrink-0 ${totalPending > 0 ? "text-blue-500" : "text-emerald-500"}`}>
              {!focusLoading && totalPending === 0 && alertCount === 0 && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
              <span>前往</span>
              <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {!focusLoading && (overdueCount > 0 || todayCount > 0 || alertCount > 0) && (
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {overdueCount > 0 && (
                <div className="flex items-center gap-1.5 bg-red-100 text-red-600 rounded-full px-3 py-1.5 text-[12px] font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  逾期未處理 {overdueCount} 件
                </div>
              )}
              {todayCount > 0 && (
                <div className="flex items-center gap-1.5 bg-blue-100 text-blue-600 rounded-full px-3 py-1.5 text-[12px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  今日待辦 {todayCount} 件
                </div>
              )}
              {alertCount > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-100 text-amber-600 rounded-full px-3 py-1.5 text-[12px] font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  委託到期提醒 {alertCount} 件
                </div>
              )}
            </div>
          )}
        </Link>

        {/* ── 帶看記錄引導 ── */}
        <Link href="/showings"
          className="block bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all group">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500 shrink-0">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-base font-black text-slate-800">帶看記錄</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {showingTotal > 0 ? `累積 ${showingTotal} 筆帶看資料` : "尚無帶看記錄，點擊新增"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-orange-500 shrink-0">
              查看全部
              <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          {showingTotal > 0 && (
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {["很有興趣", "有點興趣", "普通", "否定"].map((reaction) => {
                const cnt = showingReactions.find(r => r.reaction === reaction)?.cnt ?? 0;
                const cfg = reactionConfig[reaction];
                return (
                  <div key={reaction}
                    className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[12px] font-bold ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                    {reaction} {cnt}
                  </div>
                );
              })}
            </div>
          )}
        </Link>

        {/* ── 最新案件（緊湊清單） ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-glacier-500 tracking-[0.15em] uppercase">最新案件</p>
            <Link href="/properties"
              className="flex items-center gap-1 text-xs text-aurora-500 hover:text-aurora-400 transition-colors font-medium">
              查看全部 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 bg-titanium-900 border border-glacier-200/[0.06] rounded-xl">
              <Building2 className="w-8 h-8 text-glacier-600 mb-2" />
              <p className="text-sm font-medium text-glacier-400">尚無案件</p>
              <p className="text-xs text-glacier-600 mt-1">點擊「新增案件」開始建立委託案件資料庫</p>
            </div>
          ) : (
            <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden divide-y divide-glacier-200/[0.06]">
              {properties.slice(0, 5).map((property) => (
                <div key={property.id} className="px-4 py-3 hover:bg-titanium-800/60 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[property.status_now ?? ""] ?? "bg-slate-100 text-slate-500"}`}>
                      {property.status_now ?? "未設定"}
                    </span>
                    <span className="flex-1 text-[13px] font-semibold text-glacier-200 truncate">
                      {getTitle(property)}
                    </span>
                    <span className="text-sm font-bold text-aurora-500 shrink-0 tabular-nums">
                      {property.price_wan?.toLocaleString()}<span className="text-[10px] font-normal text-glacier-500 ml-0.5">萬</span>
                    </span>
                  </div>
                  {(property.img1_url || property.img2_url) && (
                    <div className="flex gap-1.5 mt-2">
                      {[property.img1_url, property.img2_url].map((url, i) =>
                        url ? (
                          <div key={i} className="w-14 h-10 rounded-md overflow-hidden bg-titanium-800 shrink-0">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 系統亮點 ── */}
        <div>
          <p className="text-[10px] font-bold text-glacier-500 tracking-[0.15em] uppercase mb-3">系統亮點</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                emoji: "⚙️", title: "數位雙生建檔",
                desc: "植入精通戰略的房仲大腦。用對的解方簡化流程，讓生活變好、壓力變少。",
                href: "/properties/new",
                from: "from-slate-700", to: "to-slate-800", border: "border-slate-600/60",
                titleColor: "text-white", descColor: "text-slate-300",
                ring: "hover:ring-2 hover:ring-aurora-400/50",
              },
              {
                emoji: "🪄", title: "靈感鉤子生成",
                desc: "告別長時間服務的疲累感。AI 戰略對接 DNA，一鍵產出妳專屬的高成交文案。",
                href: "/properties",
                from: "from-aurora-500", to: "to-amber-400", border: "border-aurora-400/40",
                titleColor: "text-titanium-950", descColor: "text-titanium-900/80",
                ring: "hover:ring-2 hover:ring-aurora-300/60",
              },
              {
                emoji: "📈", title: "自由時間管理",
                desc: "看見效率，奪回生活主導權。數據化妳的成功，支持妳去經營喜歡的人生。",
                href: "/daily-focus",
                from: "from-indigo-600", to: "to-blue-700", border: "border-indigo-400/40",
                titleColor: "text-white", descColor: "text-indigo-100",
                ring: "hover:ring-2 hover:ring-indigo-300/50",
              },
            ].map((item) => (
              <Link key={item.title} href={item.href}
                className={`group bg-gradient-to-br ${item.from} ${item.to} border ${item.border} rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${item.ring} block`}>
                <div className="text-3xl mb-3">{item.emoji}</div>
                <p className={`text-[15px] font-black ${item.titleColor} leading-snug`}>{item.title}</p>
                <p className={`text-[12px] ${item.descColor} mt-2 leading-relaxed`}>{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── 使用流程 ── */}
        <div>
          <p className="text-[10px] font-bold text-glacier-500 tracking-[0.15em] uppercase mb-3">使用流程</p>
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-2xl p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { step: "01", emoji: "📋", title: "新增委託案件", desc: "填入基本資料、上傳照片、選定主賣點與目標客群", href: "/properties/new" },
                { step: "02", emoji: "🏃", title: "帶看並記錄反應", desc: "每次帶看後填寫買方反應與追蹤事項，建立完整紀錄", href: "/showings" },
                { step: "03", emoji: "✍️", title: "AI 一鍵生文案", desc: "選擇案件，30 秒生成專業 Facebook / LINE 行銷文案", href: "/properties" },
                { step: "04", emoji: "📅", title: "每日重點追蹤", desc: "查看今日待辦、逾期提醒，填寫記錄穩步推進成交", href: "/daily-focus" },
              ].map((item, i, arr) => (
                <Link key={item.step} href={item.href} className="group relative">
                  <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-titanium-800/60 transition-colors">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-aurora-500/10 border border-aurora-500/20 flex items-center justify-center text-2xl group-hover:bg-aurora-500/20 transition-colors">
                        {item.emoji}
                      </div>
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-aurora-500 text-titanium-950 text-[9px] font-black flex items-center justify-center">
                        {item.step}
                      </span>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-glacier-200 group-hover:text-aurora-400 transition-colors leading-snug">{item.title}</p>
                      <p className="text-[10px] text-glacier-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden md:flex absolute top-6 -right-2 w-4 h-4 items-center justify-center z-10">
                      <ChevronRight className="w-3.5 h-3.5 text-aurora-500/50" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
        {/* ── 品牌落款 ── */}
        <div className="pt-2 pb-6 text-right">
          <p className="text-[11px] text-glacier-600 leading-relaxed tracking-wide">
            TOBE Nexus AI 執行長—
          </p>
          <p className="text-[13px] font-bold text-glacier-400 tracking-widest mt-0.5">
            Ｖｅｄａ．Ｄｕ
          </p>
        </div>

      </main>
    </div>
  );
}
