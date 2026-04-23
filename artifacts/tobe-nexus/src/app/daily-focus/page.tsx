"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { DailyFocusDrawer } from "@/components/DailyFocusDrawer";
import {
  AlertCircle, CalendarCheck, CheckCircle2, Circle,
  Users, AlertTriangle, Bell, RefreshCw, Handshake, Building2,
  Sparkles, ChevronRight, ClipboardList,
} from "lucide-react";
import type { DailyFocusItem } from "@/types";
import type { DailyLogEntry, TodayNewEntry } from "@/app/api/daily-log/route";

/* ─── Type metadata ─────────────────────────────────────────────────── */
const TYPE_META: Record<string, { icon: React.ReactNode; label: string }> = {
  buyer:    { icon: <Users className="w-4 h-4" />,         label: "買方 CRM"  },
  showing:  { icon: <CalendarCheck className="w-4 h-4" />, label: "帶看回訪" },
  colisting:{ icon: <Handshake className="w-4 h-4" />,     label: "同業聯賣" },
  property: { icon: <Building2 className="w-4 h-4" />,     label: "案件委託" },
};


/* ─── Task card ──────────────────────────────────────────────────────── */
function FocusItemRow({
  item,
  onDone,
  onClick,
}: {
  item: DailyFocusItem;
  onDone: (item: DailyFocusItem) => void;
  onClick: (item: DailyFocusItem) => void;
}) {
  const meta = TYPE_META[item.type] ?? TYPE_META.buyer;
  const canComplete = item.type !== "property";
  const overdueDays = item.is_overdue
    ? Math.ceil((Date.now() - new Date(item.date).getTime()) / 86400000)
    : 0;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-2xl border-2 bg-white shadow-sm transition-all cursor-pointer active:scale-[0.98] ${
        item.done
          ? "opacity-40 border-slate-200"
          : item.is_overdue
          ? "border-red-300 hover:border-red-400"
          : "border-blue-200 hover:border-blue-300"
      }`}
      onClick={() => onClick(item)}
    >
      {/* Checkbox — stop propagation so tapping checkbox doesn't open drawer */}
      <button
        onClick={(e) => { e.stopPropagation(); canComplete && !item.done && onDone(item); }}
        className={`mt-0.5 shrink-0 transition-transform ${
          canComplete && !item.done ? "cursor-pointer hover:scale-110 active:scale-95" : "cursor-default"
        }`}
        disabled={!canComplete || item.done}
      >
        {item.done ? (
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
        ) : (
          <Circle className={`w-7 h-7 ${item.is_overdue ? "text-red-400" : "text-blue-400"}`} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`inline-flex items-center gap-1.5 text-xs font-bold mb-1.5 px-2 py-0.5 rounded-full ${
          item.is_overdue ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
        }`}>
          {meta.icon}
          <span>{meta.label}</span>
        </div>
        <p className={`text-lg font-black leading-tight ${
          item.done ? "line-through text-slate-400" : "text-slate-900"
        }`}>
          {item.title}
        </p>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed line-clamp-1">{item.subtitle}</p>
        {!item.done && (
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />點擊填寫追蹤記錄
          </p>
        )}
      </div>

      {/* Status badge */}
      {!item.done && (
        <span className={`shrink-0 mt-1 text-sm font-black px-3 py-1.5 rounded-xl whitespace-nowrap ${
          item.is_overdue ? "bg-red-600 text-white" : "bg-blue-600 text-white"
        }`}>
          {item.is_overdue ? `逾期 ${overdueDays}天` : "今日"}
        </span>
      )}
    </div>
  );
}

function PropertyAlertRow({ item, onClick }: { item: DailyFocusItem; onClick: (item: DailyFocusItem) => void }) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-2xl border-2 border-amber-300 bg-white shadow-sm hover:border-amber-400 transition-all cursor-pointer active:scale-[0.98]"
      onClick={() => onClick(item)}
    >
      <AlertTriangle className="w-7 h-7 text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold mb-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
          <Building2 className="w-4 h-4" /><span>案件委託</span>
        </div>
        <p className="text-lg font-black text-slate-900 leading-tight">{item.title}</p>
        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{item.subtitle}</p>
        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />點擊填寫客戶經營記錄
        </p>
      </div>
      <span className="shrink-0 mt-1 text-sm font-black px-3 py-1.5 rounded-xl bg-amber-500 text-white whitespace-nowrap">
        記錄
      </span>
    </div>
  );
}

/* ─── Daily log entry row ────────────────────────────────────────────── */
const LOG_TYPE_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  buyer:    { icon: <Users className="w-3.5 h-3.5" />,         label: "買方 CRM",  color: "bg-blue-100 text-blue-700" },
  showing:  { icon: <CalendarCheck className="w-3.5 h-3.5" />, label: "帶看追蹤",  color: "bg-indigo-100 text-indigo-700" },
  colisting:{ icon: <Handshake className="w-3.5 h-3.5" />,     label: "同業聯賣",  color: "bg-purple-100 text-purple-700" },
  property: { icon: <Building2 className="w-3.5 h-3.5" />,     label: "客戶經營",  color: "bg-amber-100 text-amber-700" },
};

function LogEntryRow({ entry, onClick }: { entry: DailyLogEntry; onClick: (e: DailyLogEntry) => void }) {
  const meta = LOG_TYPE_META[entry.type] ?? LOG_TYPE_META.buyer;
  return (
    <div
      className="flex items-start gap-3 bg-white rounded-xl border border-slate-100 px-3.5 py-3 shadow-sm cursor-pointer hover:border-emerald-300 hover:shadow-md active:scale-[0.98] transition-all"
      onClick={() => onClick(entry)}
    >
      <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shrink-0 mt-0.5 ${meta.color}`}>
        {meta.icon}
        <span>{meta.label}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 leading-snug">{entry.title}</p>
        {entry.subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{entry.subtitle}</p>
        )}
        <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 leading-relaxed font-medium">
          {entry.note}
        </p>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />點擊查看原始內容
        </p>
      </div>
    </div>
  );
}

/* ─── Section wrapper ────────────────────────────────────────────────── */
function Section({
  colorBar, headerBg, headerText, dotClass, pulseDot = false,
  label, count, children,
}: {
  colorBar: string; headerBg: string; headerText: string;
  dotClass: string; pulseDot?: boolean;
  label: string; count: number; children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border-2 overflow-hidden shadow-sm ${colorBar}`}>
      <div className={`flex items-center gap-2.5 px-5 py-3 ${headerBg}`}>
        <div className={`w-2.5 h-2.5 rounded-full ${dotClass} ${pulseDot ? "animate-pulse" : ""}`} />
        <span className={`text-sm font-black uppercase tracking-wide ${headerText}`}>{label}</span>
        <span className={`ml-auto text-sm font-black w-7 h-7 rounded-full flex items-center justify-center bg-white/60 ${headerText}`}>
          {count}
        </span>
      </div>
      <div className="p-3 space-y-2 bg-slate-50/50">{children}</div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function DailyFocusPage() {
  const router = useRouter();
  const [focusItems, setFocusItems] = useState<DailyFocusItem[]>([]);
  const [focusLoading, setFocusLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DailyFocusItem | null>(null);
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());
  const [logEntries, setLogEntries] = useState<DailyLogEntry[]>([]);
  const [newEntries, setNewEntries] = useState<TodayNewEntry[]>([]);
  const [logLoading, setLogLoading] = useState(true);

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

  const loadLog = useCallback(async () => {
    setLogLoading(true);
    try {
      // Pass client-side date (both full and short format) to avoid UTC/local timezone mismatch
      const d = new Date();
      const fullPrefix  = `[${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}]`;
      const shortPrefix = `[${d.getMonth() + 1}/${d.getDate()}]`;
      const res = await fetch(
        `/api/daily-log?prefix=${encodeURIComponent(fullPrefix)}&shortPrefix=${encodeURIComponent(shortPrefix)}&_t=${Date.now()}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setLogEntries(data.entries ?? []);
        setNewEntries(data.newEntries ?? []);
      }
    } finally { setLogLoading(false); }
  }, []);

  useEffect(() => { loadFocus(); loadLog(); }, [loadFocus, loadLog]);

  // Re-fetch when user switches back to this tab / app (cross-device sync, incl. iOS Safari)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') { loadFocus(); loadLog(); } };
    const onFocus   = () => { loadFocus(); loadLog(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadFocus, loadLog]);

  const handleDone = useCallback(async (item: DailyFocusItem) => {
    // Immediately mark as done (grayed out)
    setFocusItems((prev) => prev.map((i) => i.id === item.id ? { ...i, done: true } : i));

    // Start fade-out after a short delay, then remove
    setTimeout(() => {
      setFadingIds((prev) => new Set(prev).add(item.id));
      setTimeout(() => {
        setFocusItems((prev) => prev.filter((i) => i.id !== item.id));
        setFadingIds((prev) => { const s = new Set(prev); s.delete(item.id); return s; });
      }, 500);
    }, 800);

    // API call
    if (item.type === "buyer") {
      await fetch(`/api/buyers/${item.source_id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_follow_up_date: null }),
      });
    } else if (item.type === "showing") {
      await fetch(`/api/showings/${item.source_id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follow_up_done: true }),
      });
    } else if (item.type === "colisting") {
      const today = new Date().toISOString().slice(0, 10);
      await fetch(`/api/properties/${item.source_id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colisting_last_check: today }),
      });
    }
  }, []);

  const navigateTo = useCallback((item: { type: string; source_id: string }) => {
    if (item.type === 'property' || item.type === 'colisting') {
      router.push(`/properties/${item.source_id}`);
    } else if (item.type === 'buyer') {
      router.push(`/buyers?open=${item.source_id}`);
    } else if (item.type === 'showing') {
      router.push(`/showings?open=${item.source_id}`);
    }
  }, [router]);

  const visibleItems = focusItems.filter((i) => !i.done || fadingIds.has(i.id));

  const overdueItems   = visibleItems.filter((i) => i.is_overdue && !i.done && i.type !== "property");
  const todayItems     = visibleItems.filter((i) => !i.is_overdue && !i.done && i.type !== "property");
  const propertyAlerts = visibleItems.filter((i) => i.type === "property");
  const fadingItems    = focusItems.filter((i) => i.done && fadingIds.has(i.id));
  const totalPending   = focusItems.filter((i) => !i.done && i.type !== "property").length;

  const dateStr = new Date().toLocaleDateString("zh-TW", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="每日重點"
        subtitle={dateStr}
        actions={
          <button
            onClick={() => { loadFocus(); loadLog(); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-glacier-400 bg-titanium-900 border border-glacier-200/[0.08] rounded-lg hover:text-aurora-500 hover:border-aurora-500/30 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${focusLoading ? "animate-spin" : ""}`} />
            <span>刷新</span>
          </button>
        }
      />

      <main className="flex-1 p-4 md:p-6 space-y-4 max-w-2xl w-full mx-auto">

        {/* Summary banner */}
        <div className={`flex items-center gap-4 px-5 py-5 rounded-2xl border-2 shadow-sm ${
          totalPending > 0 ? "bg-red-50 border-red-300" : "bg-emerald-50 border-emerald-300"
        }`}>
          <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${
            totalPending > 0 ? "bg-red-200" : "bg-emerald-200"
          }`}>
            {totalPending > 0
              ? <AlertCircle className="w-8 h-8 text-red-700" />
              : <Sparkles className="w-8 h-8 text-emerald-700" />}
          </div>
          <div className="flex-1">
            {totalPending > 0 ? (
              <>
                <p className="text-xl font-black text-red-800">還有 {totalPending} 件待辦</p>
                <p className="text-sm font-bold text-red-600 mt-1">
                  逾期 <span className="text-red-700">{overdueItems.length}</span> 件　·　今日 <span className="text-blue-700">{todayItems.length}</span> 件
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-black text-emerald-800">今日全部清零！</p>
                <p className="text-sm font-bold text-emerald-600 mt-1">所有任務已完成，繼續保持！</p>
              </>
            )}
          </div>
          {totalPending > 0 && (
            <span className="text-5xl font-black text-red-700 tabular-nums">{totalPending}</span>
          )}
        </div>

        {/* Loading */}
        {focusLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse border-2 border-slate-200" />
            ))}
          </div>
        )}

        {/* Fading-out items (done, transitioning out) */}
        {fadingItems.length > 0 && (
          <div className="space-y-2 transition-all duration-500 opacity-0">
            {fadingItems.map((item) => (
              <FocusItemRow key={item.id} item={item} onDone={handleDone} onClick={() => {}} />
            ))}
          </div>
        )}

        {/* Overdue */}
        {!focusLoading && overdueItems.length > 0 && (
          <Section colorBar="border-red-400" headerBg="bg-red-100" headerText="text-red-800"
            dotClass="bg-red-500" pulseDot label="逾期未處理" count={overdueItems.length}>
            {overdueItems.map((item) => (
              <FocusItemRow key={item.id} item={item} onDone={handleDone} onClick={setSelectedItem} />
            ))}
          </Section>
        )}

        {/* Today */}
        {!focusLoading && todayItems.length > 0 && (
          <Section colorBar="border-blue-300" headerBg="bg-blue-100" headerText="text-blue-800"
            dotClass="bg-blue-500" label="今日任務" count={todayItems.length}>
            {todayItems.map((item) => (
              <FocusItemRow key={item.id} item={item} onDone={handleDone} onClick={setSelectedItem} />
            ))}
          </Section>
        )}

        {/* Property alerts */}
        {!focusLoading && propertyAlerts.length > 0 && (
          <Section colorBar="border-amber-400" headerBg="bg-amber-100" headerText="text-amber-800"
            dotClass="bg-amber-500" label="委託到期提醒" count={propertyAlerts.length}>
            {propertyAlerts.map((item) => (
              <PropertyAlertRow key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </Section>
        )}

        {/* Empty */}
        {!focusLoading && totalPending === 0 && propertyAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-lg font-black text-slate-700">目前沒有任何提醒</p>
            <p className="text-sm text-slate-500 mt-2 text-center px-6 leading-relaxed">
              設定買方跟進日期或帶看回訪日期後，<br/>會自動出現在這裡
            </p>
          </div>
        )}

        {/* Today's NEW entries (created today by created_at) */}
        {!logLoading && newEntries.length > 0 && (
          <div className="rounded-2xl border-2 border-violet-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-5 py-3 bg-violet-100">
              <Sparkles className="w-4 h-4 text-violet-700" />
              <span className="text-sm font-black uppercase tracking-wide text-violet-800 flex-1">今日新增</span>
              <span className="text-sm font-black w-7 h-7 rounded-full flex items-center justify-center bg-white/60 text-violet-700">
                {newEntries.length}
              </span>
            </div>
            <div className="p-3 space-y-2 bg-slate-50/50">
              {newEntries.map((entry, i) => {
                const meta = (() => {
                  if (entry.type === 'property') return { icon: <Building2 className="w-3.5 h-3.5" />, label: '新增案件', color: 'bg-amber-100 text-amber-700' };
                  if (entry.type === 'buyer')    return { icon: <Users className="w-3.5 h-3.5" />,    label: '新增買方', color: 'bg-blue-100 text-blue-700' };
                  return { icon: <CalendarCheck className="w-3.5 h-3.5" />, label: '新增帶看', color: 'bg-indigo-100 text-indigo-700' };
                })();
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-white rounded-xl border border-slate-100 px-3.5 py-3 shadow-sm cursor-pointer hover:border-violet-300 hover:shadow-md active:scale-[0.98] transition-all"
                    onClick={() => navigateTo(entry)}
                  >
                    <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shrink-0 mt-0.5 ${meta.color}`}>
                      {meta.icon}
                      <span>{meta.label}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-snug">{entry.title}</p>
                      {entry.subtitle && (
                        <p className="text-xs text-slate-500 mt-0.5">{entry.subtitle}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" />點擊查看詳情
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Today's log — always visible */}
        {!logLoading && (
          <div className="rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-5 py-3 bg-emerald-100">
              <ClipboardList className="w-4 h-4 text-emerald-700" />
              <span className="text-sm font-black uppercase tracking-wide text-emerald-800 flex-1">今日已記錄</span>
              {logEntries.length > 0 && (
                <span className="text-sm font-black w-7 h-7 rounded-full flex items-center justify-center bg-white/60 text-emerald-700">
                  {logEntries.length}
                </span>
              )}
            </div>
            <div className="p-3 space-y-2 bg-slate-50/50">
              {logEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-sm font-semibold text-slate-500">今日尚無追蹤記錄</p>
                  <p className="text-xs text-slate-400 mt-1">在上方任務點擊完成並填寫記錄後，會自動出現在這裡</p>
                </div>
              ) : (
                logEntries.map((entry, i) => (
                  <LogEntryRow key={i} entry={entry} onClick={navigateTo} />
                ))
              )}
            </div>
          </div>
        )}

        {/* Source hint */}
        {!focusLoading && (
          <p className="text-center text-xs text-slate-400 font-medium pb-2">
            來源：買方 CRM · 帶看追蹤 · 案件委託 · 同業聯賣
          </p>
        )}
      </main>

      {/* Detail drawer */}
      <DailyFocusDrawer
        item={selectedItem}
        onClose={() => { setSelectedItem(null); loadLog(); }}
        onDone={handleDone}
      />
    </div>
  );
}
