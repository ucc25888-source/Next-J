"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import {
  AlertCircle, CalendarCheck, CheckCircle2, Circle,
  Users, AlertTriangle, Bell, RefreshCw, Handshake, Building2,
  Sparkles,
} from "lucide-react";
import type { DailyFocusItem } from "@/types";

/* ── type tag map ── */
const TYPE_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  buyer:    { icon: <Users className="w-3 h-3" />,       label: "買方 CRM",  color: "text-sky-400"    },
  showing:  { icon: <CalendarCheck className="w-3 h-3" />, label: "帶看回訪", color: "text-violet-400" },
  colisting:{ icon: <Handshake className="w-3 h-3" />,   label: "同業聯賣",  color: "text-amber-400"  },
  property: { icon: <Building2 className="w-3 h-3" />,   label: "案件委託",  color: "text-orange-400" },
};

function FocusItemRow({
  item,
  onDone,
}: {
  item: DailyFocusItem;
  onDone: (item: DailyFocusItem) => void;
}) {
  const meta = TYPE_META[item.type] ?? TYPE_META.buyer;
  const canComplete = item.type !== "property";
  const overdueDays = item.is_overdue
    ? Math.ceil((Date.now() - new Date(item.date).getTime()) / 86400000)
    : 0;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border transition-all duration-200 ${
      item.done
        ? "bg-titanium-800/40 border-white/[0.04] opacity-50"
        : item.is_overdue
        ? "bg-red-500/[0.07] border-red-500/20 hover:bg-red-500/[0.11]"
        : "bg-blue-500/[0.06] border-blue-400/20 hover:bg-blue-500/[0.10]"
    }`}>
      {/* Checkbox */}
      <button
        onClick={() => canComplete && !item.done && onDone(item)}
        className={`mt-0.5 shrink-0 transition-all ${canComplete && !item.done ? "cursor-pointer hover:scale-110 active:scale-95" : "cursor-default"}`}
        disabled={!canComplete || item.done}
      >
        {item.done ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <Circle className={`w-5 h-5 ${item.is_overdue ? "text-red-400" : "text-blue-400"}`} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Type badge */}
        <div className={`inline-flex items-center gap-1 text-[10px] font-bold mb-1.5 ${meta.color}`}>
          {meta.icon}
          <span>{meta.label}</span>
        </div>
        <p className={`text-[15px] font-bold leading-tight ${
          item.done ? "line-through text-glacier-600" : "text-white"
        }`}>
          {item.title}
        </p>
        <p className="text-[12px] text-glacier-400 mt-1 leading-relaxed">{item.subtitle}</p>
      </div>

      {/* Status badge */}
      {!item.done && (
        <span className={`shrink-0 mt-0.5 text-[11px] font-black px-2.5 py-1.5 rounded-xl ${
          item.is_overdue
            ? "bg-red-500/20 text-red-300 border border-red-500/30"
            : "bg-blue-500/20 text-blue-300 border border-blue-400/30"
        }`}>
          {item.is_overdue ? `逾期 ${overdueDays}天` : "今日"}
        </span>
      )}
    </div>
  );
}

function PropertyAlertRow({ item }: { item: DailyFocusItem }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border bg-amber-500/[0.07] border-amber-400/20 hover:bg-amber-500/[0.11] transition-all">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 mb-1.5">
          <Building2 className="w-3 h-3" /><span>案件委託</span>
        </div>
        <p className="text-[15px] font-bold text-white leading-tight">{item.title}</p>
        <p className="text-[12px] text-amber-400/80 mt-1">{item.subtitle}</p>
      </div>
      <Link href="/properties"
        className="shrink-0 mt-0.5 text-[11px] font-black px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 transition-colors">
        查看
      </Link>
    </div>
  );
}

/* ── Section wrapper ── */
function Section({
  color, dotColor, pulseDot = false, label, count, children,
}: {
  color: string; dotColor: string; pulseDot?: boolean;
  label: string; count: number; children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${color}`}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.06]">
        <div className={`w-2 h-2 rounded-full ${dotColor} ${pulseDot ? "animate-pulse" : ""}`} />
        <span className="text-[11px] font-black text-white/80 uppercase tracking-[0.13em]">
          {label}
        </span>
        <span className={`ml-auto text-[11px] font-black px-2 py-0.5 rounded-lg ${dotColor.replace("bg-", "bg-").replace("-500", "-500/20")} text-white/70`}>
          {count}
        </span>
      </div>
      <div className="p-3 space-y-2">{children}</div>
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
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-glacier-400 bg-titanium-900 border border-glacier-200/[0.08] rounded-lg hover:text-aurora-500 hover:border-aurora-500/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${focusLoading ? "animate-spin" : ""}`} />
            <span>刷新</span>
          </button>
        }
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 max-w-2xl w-full mx-auto">

        {/* ── Summary banner ── */}
        <div className={`relative overflow-hidden flex items-center gap-4 px-5 py-5 rounded-2xl border ${
          totalPending > 0
            ? "bg-gradient-to-r from-red-500/10 to-orange-500/[0.07] border-red-500/20"
            : "bg-gradient-to-r from-emerald-500/10 to-teal-500/[0.07] border-emerald-500/20"
        }`}>
          {/* Glow blob */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-30 ${
            totalPending > 0 ? "bg-red-500" : "bg-emerald-500"
          }`} />

          <div className={`relative shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
            totalPending > 0 ? "bg-red-500/20" : "bg-emerald-500/20"
          }`}>
            {totalPending > 0
              ? <AlertCircle className="w-6 h-6 text-red-400" />
              : <Sparkles className="w-6 h-6 text-emerald-400" />}
          </div>

          <div className="relative flex-1">
            {totalPending > 0 ? (
              <>
                <p className="text-base font-black text-white">還有 {totalPending} 件待辦事項</p>
                <p className="text-[12px] text-red-300/80 mt-0.5">
                  逾期 <span className="font-bold text-red-300">{overdueItems.length}</span> 件　·　今日 <span className="font-bold text-blue-300">{todayItems.length}</span> 件
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-black text-white">今日全部清零！</p>
                <p className="text-[12px] text-emerald-300/80 mt-0.5">
                  {doneItems.length > 0 ? `已完成 ${doneItems.length} 件，繼續保持！` : "目前沒有待追蹤的任務"}
                </p>
              </>
            )}
          </div>

          {totalPending > 0 && (
            <span className="relative text-3xl font-black text-red-400 tabular-nums">{totalPending}</span>
          )}
        </div>

        {/* ── Loading skeleton ── */}
        {focusLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[76px] bg-titanium-900 border border-white/[0.05] rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Overdue ── */}
        {!focusLoading && overdueItems.length > 0 && (
          <Section
            color="bg-red-500/[0.05] border-red-500/15"
            dotColor="bg-red-500" pulseDot
            label="逾期未處理" count={overdueItems.length}
          >
            {overdueItems.map((item) => (
              <FocusItemRow key={item.id} item={item} onDone={handleDone} />
            ))}
          </Section>
        )}

        {/* ── Today ── */}
        {!focusLoading && todayItems.length > 0 && (
          <Section
            color="bg-blue-500/[0.05] border-blue-400/15"
            dotColor="bg-blue-500"
            label="今日任務" count={todayItems.length}
          >
            {todayItems.map((item) => (
              <FocusItemRow key={item.id} item={item} onDone={handleDone} />
            ))}
          </Section>
        )}

        {/* ── Property alerts ── */}
        {!focusLoading && propertyAlerts.length > 0 && (
          <Section
            color="bg-amber-500/[0.05] border-amber-400/15"
            dotColor="bg-amber-500"
            label="委託到期提醒" count={propertyAlerts.length}
          >
            {propertyAlerts.map((item) => (
              <PropertyAlertRow key={item.id} item={item} />
            ))}
          </Section>
        )}

        {/* ── Done ── */}
        {!focusLoading && doneItems.length > 0 && (
          <Section
            color="bg-emerald-500/[0.04] border-emerald-500/10"
            dotColor="bg-emerald-500"
            label="已完成" count={doneItems.length}
          >
            {doneItems.map((item) => (
              <FocusItemRow key={item.id} item={item} onDone={handleDone} />
            ))}
          </Section>
        )}

        {/* ── Empty state ── */}
        {!focusLoading && totalPending === 0 && propertyAlerts.length === 0 && doneItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-titanium-900 rounded-2xl border border-white/[0.06]">
            <div className="w-16 h-16 rounded-2xl bg-aurora-500/10 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-aurora-400" />
            </div>
            <p className="text-base font-bold text-glacier-200">目前沒有任何提醒</p>
            <p className="text-sm text-glacier-500 mt-1 text-center px-6">設定買方跟進日期或帶看回訪日期後，會自動出現在這裡</p>
          </div>
        )}

        {/* ── Source hint ── */}
        {!focusLoading && (
          <p className="text-center text-[10px] text-glacier-600 pb-2">
            來源：買方 CRM · 帶看追蹤 · 案件委託 · 同業聯賣
          </p>
        )}
      </main>
    </div>
  );
}
