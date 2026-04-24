"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useSystemStore } from "@/store/useSystemStore";
import PageHeader from "@/components/PageHeader";
import {
  Building2, ChevronRight, Plus,
  AlertCircle, CheckCircle2, Bell, MoveRight,
  CalendarCheck, Smile, Meh, ThumbsDown, Star, X, ShieldAlert,
  Share2, Check,
} from "lucide-react";
import type { DailyFocusItem } from "@/types";

interface ShowingReaction { reaction: string; cnt: number; }

const DAILY_QUOTES = [
  { text: "不要等到一切完美才出發，出發了才會完美。", author: "每日正能量" },
  { text: "每一套房子背後，都是一個家的夢想。讓我們用心，幫夢想找到歸宿。", author: "房產智慧" },
  { text: "你所做的每一個準備，都是在為某個美好的結果鋪路。", author: "每日正能量" },
  { text: "成交不是終點，是信任的開始。", author: "房產哲學" },
  { text: "今天比昨天進步一點點，就是成功。", author: "每日正能量" },
  { text: "買家找的不只是房子，是對生活的想像。你的工作，是幫他們看見那個畫面。", author: "房產智慧" },
  { text: "累了就停下來，但不要放棄。休息是為了走更長遠的路。", author: "每日正能量" },
  { text: "一個真誠的問候，有時比任何話術都更有力量。", author: "溝通之道" },
  { text: "每天早上都是一次重新開始的機會，好好把握它。", author: "每日正能量" },
  { text: "好的房產顧問，賣的是安心，不只是坪數。", author: "房產哲學" },
  { text: "不管昨天發生了什麼，今天的太陽是全新的。", author: "每日正能量" },
  { text: "跟進是門藝術，堅持是種態度，成交是份禮物。", author: "房產智慧" },
  { text: "你的努力，正在以你看不見的方式，悄悄發揮作用。", author: "每日正能量" },
  { text: "花蓮的山海，是最好的鄰居。把這份美好，傳遞給每一位買家。", author: "在地情懷" },
  { text: "信任需要時間建立，但只需要一個瞬間就能感受到。", author: "溝通之道" },
  { text: "現代人最缺的不是資訊，而是讓人放鬆下來的安全感。你提供的，正是這個。", author: "房產智慧" },
  { text: "做好眼前的每一件小事，大事自然水到渠成。", author: "每日正能量" },
  { text: "有時候，最好的成交技巧，是真心聽對方說話。", author: "溝通之道" },
  { text: "即使進度緩慢，只要你還在前進，就不算失敗。", author: "每日正能量" },
  { text: "你的專業是你給客戶最好的禮物，不斷精進它。", author: "房產哲學" },
  { text: "今天種下的種子，某一天會開出你意想不到的花。", author: "每日正能量" },
  { text: "讓系統處理繁瑣，把你的精力留給最重要的人和事。", author: "工作哲學" },
  { text: "好的服務，讓客戶想起你時會微笑。", author: "溝通之道" },
  { text: "不是每天都容易，但你已經撐過了所有最難的那天。", author: "每日正能量" },
  { text: "每一次拒絕，都讓你離下一個「好」更近了。", author: "房產智慧" },
  { text: "生活的節奏由你掌控，工作的效率由系統輔助，美好的未來由你創造。", author: "工作哲學" },
  { text: "真正的財富，是把自己的時間花在真正重要的事情上。", author: "每日正能量" },
  { text: "你的溫度，是任何科技都取代不了的核心競爭力。", author: "工作哲學" },
  { text: "不必羨慕別人，你正走在屬於自己的最好路上。", author: "每日正能量" },
  { text: "把每一位客戶的信任當成禮物，用心對待，用行動回應。", author: "房產哲學" },
];

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
  const [showPwdBanner, setShowPwdBanner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareName, setShareName] = useState("");

  const todayQuote = (() => {
    const d = new Date();
    const idx = (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate()) % DAILY_QUOTES.length;
    return DAILY_QUOTES[idx];
  })();

  useEffect(() => {
    if (currentClient?.display_name && !shareName) setShareName(currentClient.display_name);
  }, [currentClient]);

  const handleShareQuote = () => {
    const name = encodeURIComponent(shareName || currentClient?.display_name || "花蓮房產顧問福哥");
    const origin = typeof window !== "undefined" ? window.location.origin : "https://tobe-nexus.replit.app";
    const url = `${origin}/quote?name=${name}`;
    window.open(url, "_blank");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  useEffect(() => {
    if (!currentClient) return;
    const key = `pwd_changed_${currentClient.client_id}`;
    if (!localStorage.getItem(key)) setShowPwdBanner(true);
  }, [currentClient]);

  const dismissPwdBanner = () => {
    if (currentClient) localStorage.setItem(`pwd_changed_${currentClient.client_id}`, '1');
    setShowPwdBanner(false);
  };

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
      numColor: "text-amber-700", labelColor: "text-slate-700", ringColor: "bg-amber-400/20",
      hint: properties.length > 0 ? `銷售中 ${activeListings} 件` : "開始登錄案件",
      hintColor: "text-amber-700",
    },
    {
      label: "熱銷中案件", value: activeListings, sub: "件", emoji: "🔥",
      badge: "LIVE", badgeStyle: "bg-emerald-100 text-emerald-600",
      gradient: "from-emerald-50 to-green-100", border: "border-emerald-200/80",
      numColor: "text-emerald-700", labelColor: "text-slate-700", ringColor: "bg-emerald-400/20",
      hint: activeListings > 0 ? "買方都在找！" : "把案件狀態設為銷售中",
      hintColor: "text-emerald-700",
    },
    {
      label: "議價∕洽談中", value: negotiatingCount, sub: "件", emoji: "💬",
      badge: "成交在即", badgeStyle: "bg-sky-100 text-sky-600",
      gradient: "from-sky-50 to-blue-100", border: "border-sky-200/80",
      numColor: "text-sky-700", labelColor: "text-slate-700", ringColor: "bg-sky-400/20",
      hint: negotiatingCount > 0 ? "把握機會，加把勁！" : "持續跟進，等待時機",
      hintColor: "text-sky-700",
    },
    {
      label: "AI 文案生成", value: currentClient?.used_this_month ?? 0, sub: "次", emoji: "⚡",
      badge: "本月", badgeStyle: "bg-violet-100 text-violet-600",
      gradient: "from-violet-50 to-purple-100", border: "border-violet-200/80",
      numColor: "text-violet-700", labelColor: "text-slate-700", ringColor: "bg-violet-400/20",
      hint: `配額 ${currentClient?.monthly_quota ?? 0} 次`,
      hintColor: "text-violet-700",
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
        title={`早安！戰鬥力滿格的${currentClient?.display_name ?? "妳"}，今天準備好要讓哪一位買家心動成交了嗎？🚀`}
        mobileTitle={`今天讓哪位買家心動成交？🚀`}
        subtitle="把繁瑣交給系統，把靈魂還給自己 — Veda"
        actions={
          <Link href="/properties/new"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm">
            <Plus className="w-3.5 h-3.5" /> 新增案件
          </Link>
        }
      />

      {/* ── 換密碼提示橫幅 ── */}
      {showPwdBanner && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-50 border-b border-orange-100 border-l-4 border-l-orange-400">
          <ShieldAlert className="w-4 h-4 text-orange-500 shrink-0" />
          <p className="text-[12px] text-slate-700 flex-1">
            您目前使用的是初始存取碼，建議盡快
            <Link href="/settings" onClick={dismissPwdBanner}
              className="underline underline-offset-2 font-bold mx-1 text-violet-700 hover:text-violet-900 transition-colors">
              前往設定修改
            </Link>
            以保護帳號安全。
          </p>
          <button onClick={dismissPwdBanner} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-5 lg:space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label}
              className={`relative bg-gradient-to-br ${card.gradient} rounded-2xl p-5 border-2 ${card.border} overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group cursor-default`}>
              <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full ${card.ringColor} transition-transform duration-500 group-hover:scale-125`} />
              <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl ${card.ringColor} opacity-60`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl leading-none drop-shadow-sm">{card.emoji}</span>
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${card.badgeStyle} tracking-wider uppercase whitespace-nowrap shadow-sm`}>
                    {card.badge}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-[3rem] font-black leading-none ${card.numColor} tabular-nums drop-shadow-sm`}>{card.value}</span>
                  <span className={`text-lg font-black ${card.numColor} opacity-60`}>{card.sub}</span>
                </div>
                <p className={`mt-1.5 text-[14px] font-black ${card.labelColor} tracking-tight`}>{card.label}</p>
                <p className={`mt-1.5 text-[11px] font-bold ${card.hintColor} opacity-90`}>{card.hint}</p>
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
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 shrink-0">
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

        {/* ── TOBE 每日一句正能量 ── */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* layered background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.3)_0%,transparent_60%)]" />
          {/* decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />

          <div className="relative px-5 pt-5 pb-4">
            {/* header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <div>
                  <p className="text-[11px] font-black text-purple-200 tracking-[0.18em] uppercase">TOBE 每日一句正能量</p>
                  <p className="text-[9px] text-purple-300/70 mt-0.5">房產 · 工作 · 現代人的向上力量</p>
                </div>
              </div>
              <button onClick={handleShareQuote}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 shrink-0
                  ${copied
                    ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white active:scale-95"
                  }`}>
                {copied
                  ? <><Check className="w-3.5 h-3.5" /> 已開啟！</>
                  : <><Share2 className="w-3.5 h-3.5" /> 產生分享圖片</>
                }
              </button>
            </div>

            {/* quote */}
            <div className="border-l-4 border-purple-300/60 pl-4 mb-4">
              <p className="text-white font-bold text-[16px] md:text-[18px] leading-relaxed tracking-wide">
                「{todayQuote.text}」
              </p>
            </div>

            {/* footer: author + name input */}
            <div className="flex items-end justify-between gap-3">
              <div className="shrink-0">
                <span className="text-purple-300 text-[11px]">— {todayQuote.author}</span>
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[9px] text-purple-300/60 mb-1 text-right tracking-widest uppercase">
                  在 LINE / FB 希望朋友怎麼稱呼你？
                </label>
                <input
                  type="text"
                  value={shareName}
                  onChange={(e) => setShareName(e.target.value)}
                  placeholder={currentClient?.display_name ?? "輸入你的名字"}
                  maxLength={20}
                  className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-3 py-1.5 text-[12px] font-bold text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-300/60 focus:bg-white/15 transition-all text-right"
                />
              </div>
            </div>

            {/* share hint */}
            {copied && (
              <div className="mt-3 bg-emerald-400/15 border border-emerald-400/30 rounded-xl px-3 py-2">
                <p className="text-[11px] text-emerald-300 text-center">
                  已開啟圖片頁面，點「儲存圖片」後直接貼到 LINE / FB 傳送 🎉
                </p>
              </div>
            )}
          </div>
        </div>

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

        {/* ── 使用流程 ── */}
        <div>
          <p className="text-[10px] font-bold text-glacier-500 tracking-[0.15em] uppercase mb-3">使用流程</p>
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-2xl px-4 py-3">
            <div className="grid grid-cols-2 md:flex md:items-center gap-2">
              {[
                { step: "01", emoji: "🎯", title: "建案分析", href: "/properties/new" },
                { step: "02", emoji: "🔥", title: "帶看記錄", href: "/showings" },
                { step: "03", emoji: "⚡", title: "生成文案", href: "/ai-copy" },
                { step: "04", emoji: "🔔", title: "每日追蹤", href: "/daily-focus" },
              ].map((item, i, arr) => (
                <div key={item.step} className="flex items-center gap-1.5 md:flex-1 min-w-0">
                  <Link href={item.href}
                    className="group flex items-center gap-2 flex-1 min-w-0 px-2.5 py-2 rounded-xl hover:bg-titanium-800/60 transition-colors">
                    <span className="w-5 h-5 rounded-full bg-aurora-500 text-titanium-950 text-[9px] font-black flex items-center justify-center shrink-0">
                      {item.step}
                    </span>
                    <span className="text-sm leading-none shrink-0">{item.emoji}</span>
                    <span className="text-[11px] font-bold text-glacier-300 group-hover:text-aurora-400 transition-colors whitespace-nowrap">{item.title}</span>
                  </Link>
                  {i < arr.length - 1 && (
                    <ChevronRight className="hidden md:block w-3 h-3 text-aurora-500/40 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
