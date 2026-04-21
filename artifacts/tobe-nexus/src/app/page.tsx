"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useSystemStore } from "@/store/useSystemStore";
import PageHeader from "@/components/PageHeader";
import {
  Building2, Sparkles, TrendingUp, ChevronRight,
  ArrowUpRight, Plus, PenTool,
  AlertCircle, CalendarCheck, CheckCircle2, Circle,
  Users, AlertTriangle, Bell, RefreshCw,
} from "lucide-react";
import type { DailyFocusItem } from "@/types";

/* ── Daily Focus helpers ── */
function FocusItemRow({
  item,
  onDone,
}: {
  item: DailyFocusItem;
  onDone: (item: DailyFocusItem) => void;
}) {
  const typeIcon = item.type === "buyer"
    ? <Users className="w-3 h-3 shrink-0" />
    : item.type === "showing"
    ? <CalendarCheck className="w-3 h-3 shrink-0" />
    : <Building2 className="w-3 h-3 shrink-0" />;

  const canComplete = item.type !== "property";

  return (
    <div className={`flex items-start gap-3 py-2.5 px-3 rounded-lg transition-all ${
      item.done ? "opacity-50" : "hover:bg-black/[0.02]"
    }`}>
      <button
        onClick={() => canComplete && onDone(item)}
        className={`mt-0.5 shrink-0 transition-all ${canComplete ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        disabled={!canComplete || item.done}
      >
        {item.done
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          : <Circle className={`w-4 h-4 ${item.is_overdue ? "text-red-400" : "text-blue-400"}`} />
        }
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`${item.is_overdue ? "text-red-500" : "text-blue-500"}`}>{typeIcon}</span>
          <p className={`text-sm font-semibold leading-tight ${item.done ? "line-through text-glacier-500" : "text-glacier-200"}`}>
            {item.title}
          </p>
        </div>
        <p className="text-[11px] text-glacier-500 mt-0.5 leading-relaxed">{item.subtitle}</p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
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
    <div className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-amber-50/50 transition-all">
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-glacier-200 leading-tight">{item.title}</p>
        <p className="text-[11px] text-amber-600 mt-0.5">{item.subtitle}</p>
      </div>
      <Link href="/properties"
        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors shrink-0">
        查看
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const properties = usePropertyStore((s) => s.properties);
  const copies = useSystemStore((s) => s.copies);
  const currentClient = useSystemStore((s) => s.currentClient);

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
    // Optimistically update
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
    }
  };

  const activeListings   = properties.filter((p) => p.status_now === "銷售中").length;
  const thisMonthNew     = properties.filter((p) => new Date(p.createdAt).getMonth() === new Date().getMonth()).length;

  const overdueItems   = focusItems.filter((i) => i.is_overdue && !i.done && i.type !== "property");
  const todayItems     = focusItems.filter((i) => !i.is_overdue && !i.done && i.type !== "property");
  const propertyAlerts = focusItems.filter((i) => i.type === "property");
  const doneItems      = focusItems.filter((i) => i.done && i.type !== "property");
  const totalPending   = overdueItems.length + todayItems.length;

  const stats = [
    { label: "總管理案件", value: String(properties.length), sub: "件", icon: Building2, accent: true },
    { label: "銷售中案件", value: String(activeListings), sub: "件", icon: TrendingUp, accent: true },
    { label: "本月新增案件", value: String(thisMonthNew), sub: "件", icon: Building2, accent: false },
    { label: "AI 文案生成", value: String(currentClient?.used_this_month ?? 0), sub: "次", icon: Sparkles, accent: false },
  ];

  const getTitle = (p: ReturnType<typeof usePropertyStore.getState>["properties"][0]) =>
    `${p.listing_id ? `[${p.listing_id}] ` : ""}${p.subarea} ${p.property_type}`;

  void copies;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="總覽儀表板"
        subtitle={`歡迎回來，${currentClient?.display_name ?? "用戶"} · TOBE-Nexus Business AI Hub`}
        actions={
          <Link href="/properties/new"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm">
            <Plus className="w-3.5 h-3.5" /> 新增案件
          </Link>
        }
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-5 lg:space-y-7">

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label}
                className={`relative bg-titanium-900 rounded-xl p-5 border transition-all duration-200 hover:translate-y-[-1px] ${
                  stat.accent ? "border-aurora-500/15 hover:border-aurora-500/30" : "border-glacier-200/[0.06] hover:border-glacier-200/[0.12]"
                }`}>
                {stat.accent && <div className="absolute inset-0 rounded-xl bg-aurora-500/[0.03] pointer-events-none" />}
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.accent ? "bg-aurora-500/10" : "bg-titanium-700/60"}`}>
                    <Icon className={`w-4 h-4 ${stat.accent ? "text-aurora-500" : "text-glacier-500"}`} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-glacier-200 leading-none">{stat.value}</p>
                  <span className="text-xs text-glacier-500">{stat.sub}</span>
                </div>
                <p className="mt-1.5 text-xs font-semibold text-glacier-400">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* ── Daily Focus Section ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500 shadow-sm">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-glacier-200">每日重點</h2>
                <p className="text-[10px] text-glacier-500 mt-0.5">
                  {new Date().toLocaleDateString("zh-TW", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
              {totalPending > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-red-500 text-white shadow-sm">
                  <AlertCircle className="w-3 h-3" /> {totalPending} 件待辦
                </span>
              )}
            </div>
            <button onClick={loadFocus}
              className={`p-2 rounded-lg text-glacier-500 hover:text-aurora-500 hover:bg-aurora-500/[0.08] transition-all ${focusLoading ? "animate-spin" : ""}`}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {focusLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : totalPending === 0 && propertyAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-emerald-600">今日全部清零！</p>
              <p className="text-xs text-glacier-500 mt-1">沒有待追蹤的任務</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {/* Overdue section */}
              {overdueItems.length > 0 && (
                <div className="p-4 space-y-1 bg-red-50/40">
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">逾期未處理 ({overdueItems.length})</span>
                  </div>
                  {overdueItems.map((item) => (
                    <FocusItemRow key={item.id} item={item} onDone={handleDone} />
                  ))}
                </div>
              )}

              {/* Today section */}
              {todayItems.length > 0 && (
                <div className="p-4 space-y-1 bg-blue-50/30">
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">今日任務 ({todayItems.length})</span>
                  </div>
                  {todayItems.map((item) => (
                    <FocusItemRow key={item.id} item={item} onDone={handleDone} />
                  ))}
                </div>
              )}

              {/* Property alerts */}
              {propertyAlerts.length > 0 && (
                <div className="p-4 space-y-1 bg-amber-50/40">
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">委託到期提醒 ({propertyAlerts.length})</span>
                  </div>
                  {propertyAlerts.map((item) => (
                    <PropertyAlertRow key={item.id} item={item} />
                  ))}
                </div>
              )}

              {/* Done items (collapsible) */}
              {doneItems.length > 0 && (
                <div className="p-4 space-y-1 bg-slate-50/50">
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">已完成 ({doneItems.length})</span>
                  </div>
                  {doneItems.map((item) => (
                    <FocusItemRow key={item.id} item={item} onDone={handleDone} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer hint */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[10px] text-glacier-500">來源：買方 CRM · 帶看追蹤 · 案件委託</p>
            <Link href="/buyers"
              className="text-[10px] font-semibold text-aurora-500 hover:text-aurora-400 transition-colors flex items-center gap-1">
              管理買方 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Recent Properties */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-glacier-500 tracking-[0.15em] uppercase">最新案件</p>
            <Link href="/properties"
              className="flex items-center gap-1 text-xs text-aurora-500 hover:text-aurora-400 transition-colors font-medium">
              查看全部 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-titanium-900 border border-glacier-200/[0.06] rounded-xl">
              <Building2 className="w-10 h-10 text-glacier-600 mb-3" />
              <p className="text-sm font-medium text-glacier-400">尚無案件</p>
              <p className="text-xs text-glacier-600 mt-1">點擊「新增案件」開始建立您的委託案件資料庫</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.slice(0, 4).map((property) => (
                <div key={property.id}
                  className="group bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden hover:border-aurora-500/20 transition-all duration-200">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-titanium-800">
                    <img
                      src={property.img1_url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"}
                      alt={getTitle(property)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-titanium-700 text-glacier-500 border border-glacier-200/[0.06] font-medium">
                        {property.rooms}房{property.halls}廳{property.baths}衛
                      </span>
                    </div>
                    <h3 className="text-[13px] font-bold text-glacier-200 truncate" title={getTitle(property)}>
                      {getTitle(property)}
                    </h3>
                    <p className="text-lg font-bold text-aurora-500 mt-1">
                      {property.price_wan?.toLocaleString()} <span className="text-xs font-normal text-glacier-500">萬</span>
                    </p>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-glacier-200/[0.06]">
                      <Link href={`/properties/${property.id}`}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-glacier-400 bg-titanium-800 border border-glacier-200/[0.08] rounded-lg hover:border-glacier-200/15 hover:text-glacier-200 transition-all">
                        <PenTool className="w-3 h-3" /> 編輯
                      </Link>
                      <Link href={`/generate/${property.id}`}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all">
                        <Sparkles className="w-3 h-3" /> 生文案
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-[10px] font-bold text-glacier-500 tracking-[0.15em] uppercase mb-4">快捷操作</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "新增案件", desc: "登錄新的委託案件資訊", href: "/properties/new", icon: Plus },
              { label: "AI 文案生成", desc: "先到案件頁選擇案件後生成", href: "/properties", icon: Sparkles },
              { label: "帳號資訊", desc: "查看帳號狀態與本月用量", href: "/settings", icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href}
                  className="flex items-center gap-3 bg-titanium-900 border border-glacier-200/[0.06] rounded-xl p-4 hover:border-aurora-500/25 hover:bg-titanium-900/80 transition-all group">
                  <div className="p-2.5 rounded-xl bg-aurora-500/10 border border-aurora-500/15 group-hover:bg-aurora-500/15 transition-colors shrink-0">
                    <Icon className="w-4 h-4 text-aurora-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-glacier-200 group-hover:text-aurora-400 transition-colors">{item.label}</p>
                    <p className="text-xs text-glacier-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-glacier-600 group-hover:text-aurora-500 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
