"use client";

import Link from "next/link";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useSystemStore } from "@/store/useSystemStore";
import PageHeader from "@/components/PageHeader";
import {
  Building2, Sparkles, TrendingUp, ChevronRight,
  ArrowUpRight, Plus, PenTool,
} from "lucide-react";

export default function DashboardPage() {
  const properties = usePropertyStore((s) => s.properties);
  const copies = useSystemStore((s) => s.copies);
  const currentClient = useSystemStore((s) => s.currentClient);

  const activeListings = properties.filter((p) => p.status_now === '銷售中').length;
  const thisMonthNew = properties.filter(
    (p) => new Date(p.createdAt).getMonth() === new Date().getMonth()
  ).length;

  const stats = [
    { label: "總管理案件", value: String(properties.length), sub: "件", icon: Building2, accent: true },
    { label: "銷售中案件", value: String(activeListings), sub: "件", icon: TrendingUp, accent: true },
    { label: "本月新增案件", value: String(thisMonthNew), sub: "件", icon: Building2, accent: false },
    { label: "AI 文案生成", value: String(copies.length), sub: "次", icon: Sparkles, accent: false },
  ];

  const getTitle = (p: ReturnType<typeof usePropertyStore.getState>['properties'][0]) =>
    `${p.listing_id ? `[${p.listing_id}] ` : ''}${p.subarea} ${p.property_type}`;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="總覽儀表板"
        subtitle={`歡迎回來，${currentClient?.display_name ?? '用戶'} · TOBE-Nexus Business AI Hub`}
        actions={
          <Link
            href="/properties/new"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            新增案件
          </Link>
        }
      />

      <main className="flex-1 p-8 space-y-7">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`relative bg-titanium-900 rounded-xl p-5 border transition-all duration-200 hover:translate-y-[-1px] ${
                  stat.accent ? "border-aurora-500/15 hover:border-aurora-500/30" : "border-glacier-200/[0.06] hover:border-glacier-200/[0.12]"
                }`}
              >
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

        {/* Recent Properties */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-glacier-500 tracking-[0.15em] uppercase">最新案件</p>
            <Link href="/properties" className="flex items-center gap-1 text-xs text-aurora-500 hover:text-aurora-400 transition-colors font-medium">
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
                <div key={property.id} className="group bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden hover:border-aurora-500/20 transition-all duration-200">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-titanium-800">
                    <img
                      src={property.img1_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'}
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
                    <h3 className="text-[13px] font-bold text-glacier-200 truncate" title={getTitle(property)} translate="no">
                      {getTitle(property)}
                    </h3>
                    <p className="text-lg font-bold text-aurora-500 mt-1">
                      {property.price_wan?.toLocaleString()} <span className="text-xs font-normal text-glacier-500">萬</span>
                    </p>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-glacier-200/[0.06]">
                      <Link
                        href={`/properties/${property.id}`}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-glacier-400 bg-titanium-800 border border-glacier-200/[0.08] rounded-lg hover:border-glacier-200/15 hover:text-glacier-200 transition-all"
                      >
                        <PenTool className="w-3 h-3" /> 編輯
                      </Link>
                      <Link
                        href={`/generate/${property.id}`}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all"
                      >
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
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 bg-titanium-900 border border-glacier-200/[0.06] rounded-xl p-4 hover:border-aurora-500/25 hover:bg-titanium-900/80 transition-all group"
                >
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
