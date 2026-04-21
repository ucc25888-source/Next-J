"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import {
  AlertCircle, CalendarCheck, CheckCircle2, Circle,
  Users, AlertTriangle, Bell, RefreshCw, Handshake, Building2,
} from "lucide-react";
import type { DailyFocusItem } from "@/types";

function FocusItemRow({
  item,
  onDone,
}: {
  item: DailyFocusItem;
  onDone: (item: DailyFocusItem) => void;
}) {
  const typeIcon =
    item.type === "buyer" ? <Users className="w-3 h-3 shrink-0" />
    : item.type === "showing" ? <CalendarCheck className="w-3 h-3 shrink-0" />
    : item.type === "colisting" ? <Handshake className="w-3 h-3 shrink-0" />
    : <Building2 className="w-3 h-3 shrink-0" />;

  const canComplete = item.type !== "property";

  return (
    <div className={`flex items-start gap-3 py-3 px-4 rounded-xl transition-all ${
      item.done ? "opacity-50" : "hover:bg-black/[0.02]"
    }`}>
      <button
        onClick={() => canComplete && onDone(item)}
        className={`mt-0.5 shrink-0 transition-all ${canComplete ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        disabled={!canComplete || item.done}
      >
        {item.done
          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          : <Circle className={`w-5 h-5 ${item.is_overdue ? "text-red-400" : "text-blue-400"}`} />
        }
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`${item.is_overdue ? "text-red-500" : "text-blue-500"}`}>{typeIcon}</span>
          <p className={`text-sm font-semibold leading-tight ${item.done ? "line-through text-glacier-500" : "text-glacier-200"}`}>
            {item.title}
          </p>
        </div>
        <p className="text-[12px] text-glacier-500 mt-0.5 leading-relaxed">{item.subtitle}</p>
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
        item.is_overdue
          ? "bg-red-100 text-red-600 border border-red-200"
          : "bg-blue-50 text-blue-600 border border-blue-200"
      }`}>
        {item.is_overdue
          ? `逾期 ${Math.ceil((Date.now() - new Date(item.date).getTime()) / 86400000)} 天`
          : "今日"}
      </span>
    </div>
  );
}

function PropertyAlertRow({ item }: { item: DailyFocusItem }) {
  return (
    <div className="flex items-start gap-3 py-3 px-4 rounded-xl hover:bg-amber-50/50 transition-all">
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-glacier-200 leading-tight">{item.title}</p>
        <p className="text-[12px] text-amber-600 mt-0.5">{item.subtitle}</p>
      </div>
      <Link href="/properties"
        className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors shrink-0">
        查看
      </Link>
    </div>
  );
}

export default function DailyFocusPage() {
  const [focusItems, setFocusItems] = useState<DailyFocusItem[]>([]);
  const [focusLoading, setFocusLoading] = useState(true);

  const loadFocus = useCallback(async () => {
    setFocusLoading(true);
    try {
      const res = await fetch("/api/daily-focus");
      if (res.ok) {
        const d = await res.json();
        setFocusItems(d.items ?? []);
      }
    } finally { setFocusLoading(false); }
  }, []);

  useEffect(() => { loadFocus(); }, [loadFocus]);

  const handleDone = async (item: DailyFocusItem) => {
    setFocusItems((prev) => prev.map((i) => i.id === item.id ? { ...i, done: true } : i));

    if (item.type === "buyer") {
      await fetch(`/api/buyers/${item.source_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_follow_up_date: null }),
      });
    } else if (item.type === "showing") {
      await fetch(`/api/showings/${item.source_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follow_up_done: true }),
      });
    } else if (item.type === "colisting") {
      const today = new Date().toISOString().slice(0, 10);
      await fetch(`/api/properties/${item.source_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colisting_last_check: today }),
      });
    }
  };

  const overdueItems   = focusItems.filter((i) => i.is_overdue && !i.done && i.type !== "property");
  const todayItems     = focusItems.filter((i) => !i.is_overdue && !i.done && i.type !== "property");
  const propertyAlerts = focusItems.filter((i) => i.type === "property");
  const doneItems      = focusItems.filter((i) => i.done && i.type !== "property");
  const totalPending   = overdueItems.length + todayItems.length;

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
            onClick={loadFocus}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-glacier-400 bg-titanium-900 border border-glacier-200/[0.08] rounded-lg hover:text-aurora-500 hover:border-aurora-500/30 transition-all ${focusLoading ? "animate-spin" : ""}`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className={focusLoading ? "hidden" : ""}>刷新</span>
          </button>
        }
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 max-w-2xl w-full mx-auto">

        {/* Summary banner */}
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${
          totalPending > 0
            ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-200/60"
            : "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/60"
        }`}>
          <div className={`p-2.5 rounded-xl ${totalPending > 0 ? "bg-red-100" : "bg-emerald-100"}`}>
            {totalPending > 0
              ? <AlertCircle className="w-5 h-5 text-red-500" />
              : <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            }
          </div>
          <div className="flex-1">
            {totalPending > 0 ? (
              <>
                <p className="text-sm font-bold text-red-700">還有 {totalPending} 件待辦事項</p>
                <p className="text-xs text-red-500 mt-0.5">逾期 {overdueItems.length} 件 · 今日 {todayItems.length} 件</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-emerald-700">今日全部清零！</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {doneItems.length > 0 ? `已完成 ${doneItems.length} 件，繼續保持！` : "目前沒有待追蹤的任務"}
                </p>
              </>
            )}
          </div>
          {totalPending > 0 && (
            <span className="text-xl font-black text-red-500">{totalPending}</span>
          )}
        </div>

        {/* Loading skeleton */}
        {focusLoading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Overdue */}
        {!focusLoading && overdueItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-200/60 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-red-100 bg-red-50/60">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] font-black text-red-600 uppercase tracking-wider">
                逾期未處理（{overdueItems.length}）
              </span>
            </div>
            <div className="divide-y divide-slate-50 p-1">
              {overdueItems.map((item) => (
                <FocusItemRow key={item.id} item={item} onDone={handleDone} />
              ))}
            </div>
          </div>
        )}

        {/* Today */}
        {!focusLoading && todayItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-blue-200/60 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-blue-100 bg-blue-50/60">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">
                今日任務（{todayItems.length}）
              </span>
            </div>
            <div className="divide-y divide-slate-50 p-1">
              {todayItems.map((item) => (
                <FocusItemRow key={item.id} item={item} onDone={handleDone} />
              ))}
            </div>
          </div>
        )}

        {/* Property alerts */}
        {!focusLoading && propertyAlerts.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200/60 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-amber-100 bg-amber-50/60">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[11px] font-black text-amber-600 uppercase tracking-wider">
                委託到期提醒（{propertyAlerts.length}）
              </span>
            </div>
            <div className="divide-y divide-slate-50 p-1">
              {propertyAlerts.map((item) => (
                <PropertyAlertRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Done items */}
        {!focusLoading && doneItems.length > 0 && (
          <div className="bg-white/60 rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">
                已完成（{doneItems.length}）
              </span>
            </div>
            <div className="divide-y divide-slate-50 p-1">
              {doneItems.map((item) => (
                <FocusItemRow key={item.id} item={item} onDone={handleDone} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!focusLoading && totalPending === 0 && propertyAlerts.length === 0 && doneItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
            <Bell className="w-12 h-12 text-glacier-400 mb-3" />
            <p className="text-base font-bold text-glacier-300">目前沒有任何提醒</p>
            <p className="text-sm text-glacier-500 mt-1">設定買方跟進日期或帶看回訪日期後，會自動出現在這裡</p>
          </div>
        )}

        {/* Source hint */}
        {!focusLoading && (
          <p className="text-center text-[10px] text-glacier-600 pb-2">
            來源：買方 CRM · 帶看追蹤 · 案件委託 · 同業聯賣
          </p>
        )}
      </main>
    </div>
  );
}
