"use client";

import { useState } from "react";
import Link from "next/link";
import { usePropertyStore } from "@/store/usePropertyStore";
import PageHeader from "@/components/PageHeader";
import {
  Plus, Search, Building2, MapPin, Ruler,
  PenTool, Trash2, CalendarClock, Phone,
} from "lucide-react";
import { getAreaDisplay } from "@/utils/areaDisplay";

const ALERT_BADGE: Record<string, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

export default function PropertiesPage() {
  const { properties, deleteProperty } = usePropertyStore();
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = q
    ? properties.filter(
        (p) =>
          p.subarea.toLowerCase().includes(q) ||
          (p.listing_id ?? '').toLowerCase().includes(q) ||
          p.property_type.toLowerCase().includes(q) ||
          (p.address_note ?? '').toLowerCase().includes(q) ||
          (p.colisting_company ?? '').toLowerCase().includes(q)
      )
    : properties;

  const getTitle = (p: typeof properties[0]) =>
    `${p.listing_id ? `[${p.listing_id}] ` : ""}${p.subarea} ${p.property_type}`;

  const statusCls: Record<string, string> = {
    銷售中:   "bg-aurora-500/10 text-aurora-400 border-aurora-500/25",
    新進案:   "bg-glacier-500/10 text-glacier-400 border-glacier-500/20",
    議價中:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
    洽談中:   "bg-orange-500/10 text-orange-400 border-orange-500/25",
    已成交:   "bg-titanium-700/50 text-glacier-300 border-titanium-600/40",
    暫停:     "bg-titanium-700/30 text-glacier-500 border-titanium-600/30",
    評估排除: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const getContractDaysLeft = (endDate: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="案件管理"
        subtitle={`管理所有委託案件 · 共 ${properties.length} 件`}
        actions={
          <>
            <Link
              href="/properties/new"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              新增案件
            </Link>
          </>
        }
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 lg:space-y-6">
        {/* Search */}
        <div className="relative max-w-full md:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-glacier-500" />
          <input
            type="text"
            placeholder="搜尋地段、編號、案件類型..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-titanium-900 border border-glacier-200/[0.08] rounded-lg text-sm text-glacier-200 placeholder-glacier-600 focus:outline-none focus:border-aurora-500/40 transition-colors"
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-titanium-900 border-2 border-dashed border-glacier-200/[0.08] rounded-xl">
            <Building2 className="w-12 h-12 text-glacier-600 mb-3" />
            <p className="text-sm font-medium text-glacier-400">
              {search ? "找不到符合的案件" : "尚無案件"}
            </p>
            <p className="text-xs text-glacier-600 mt-1">
              {search ? "嘗試不同的關鍵字" : "點擊「新增案件」建立第一筆委託案件"}
            </p>
            {!search && (
              <Link
                href="/properties/new"
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all"
              >
                <Plus className="w-4 h-4" /> 新增案件
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((property) => {
              const sc = statusCls[property.status_now] ?? statusCls["新進案"];
              const alertEmoji = ALERT_BADGE[property.alert_level ?? 'green'] ?? '🟢';
              const daysLeft = getContractDaysLeft(property.contract_end_date);
              const expiringSoon = daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
              const expired = daysLeft !== null && daysLeft < 0;
              const todayStr = new Date().toISOString().slice(0, 10);
              const ownerFollowUp = property.owner_follow_up_date ?? null;
              const ownerOverdue = ownerFollowUp && ownerFollowUp < todayStr;
              const ownerToday = ownerFollowUp && ownerFollowUp === todayStr;

              return (
                <div
                  key={property.id}
                  translate="no"
                  suppressHydrationWarning
                  className={`group bg-titanium-900 border rounded-xl overflow-hidden transition-all duration-200 flex flex-col ${
                    property.alert_level === 'red'
                      ? 'border-red-500/25 hover:border-red-500/40'
                      : property.alert_level === 'yellow'
                      ? 'border-yellow-500/20 hover:border-yellow-500/35'
                      : 'border-glacier-200/[0.07] hover:border-aurora-500/20'
                  }`}
                >
                  {/* Image — click to open */}
                  <Link href={`/properties/${property.id}`} className="relative aspect-[4/3] w-full overflow-hidden bg-titanium-800 block">
                    <img
                      src={property.img1_url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"}
                      alt={getTitle(property)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Status badge */}
                    {property.status_now && (
                      <div translate="no" className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-semibold border ${sc}`}>
                        {property.status_now}
                      </div>
                    )}
                    {/* Alert level + Commission type */}
                    <div translate="no" className="absolute top-2 left-2 flex gap-1 flex-col">
                      <span className="text-sm leading-none">{alertEmoji}</span>
                      {property.commission_type && (
                        <span translate="no" className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          property.commission_type === '專任'
                            ? 'bg-aurora-500 text-titanium-950'
                            : property.commission_type === '同業聯賣'
                            ? 'bg-blue-500 text-white'
                            : 'bg-titanium-800/80 text-glacier-400'
                        }`}>
                          {property.commission_type === '同業聯賣' ? '🤝聯賣' : property.commission_type}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2">
                      {!['土地 / 農地', '建地 / 工業地'].includes(property.property_type) && (
                        <span className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded bg-titanium-700 text-glacier-500 border border-glacier-200/[0.06] font-medium">
                          {property.rooms}房{property.halls}廳{property.baths}衛
                        </span>
                      )}
                      <h3
                        className="mt-1.5 text-[13px] font-bold text-glacier-200 truncate"
                        title={getTitle(property)}
                      >
                        {getTitle(property)}
                      </h3>
                    </div>
                    <p className="text-xl font-bold text-aurora-500 mb-3">
                      {property.price_wan?.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-glacier-500">萬</span>
                    </p>
                    <div suppressHydrationWarning className="space-y-1.5 text-xs text-glacier-500 mb-4 flex-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-glacier-600 shrink-0" />
                        <span translate="no" className="truncate">{property.address_note || property.subarea || "無地址備註"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Ruler className="w-3 h-3 text-glacier-600 shrink-0" />
                        <span translate="no" suppressHydrationWarning>
                          {getAreaDisplay(property.property_type, property.build_ping, property.land_ping)}
                        </span>
                      </div>
                      {/* Contract expiry warning */}
                      {(expiringSoon || expired) && (
                        <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${expired ? 'text-red-400' : 'text-yellow-400'}`}>
                          <CalendarClock className="w-3 h-3 shrink-0" />
                          <span>
                            {expired
                              ? `委託已過期 ${Math.abs(daysLeft!)} 天`
                              : `委託剩 ${daysLeft} 天`}
                          </span>
                        </div>
                      )}
                      {/* Owner follow-up badge */}
                      {(ownerOverdue || ownerToday) && (
                        <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${ownerOverdue ? 'text-red-400' : 'text-amber-400'}`}>
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{ownerOverdue ? '屋主跟進已逾期' : '今天需跟進屋主'}</span>
                        </div>
                      )}
                      {/* FB post count */}
                      {(property.fb_post_count ?? 0) > 0 && (
                        <div className="text-[10px] text-glacier-600">
                          📢 已發文 {property.fb_post_count} 次
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-3 border-t border-glacier-200/[0.06] space-y-2">
                      <Link
                        href={`/properties/${property.id}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-glacier-300 bg-titanium-800 border border-glacier-200/[0.08] rounded-lg hover:border-glacier-200/20 hover:text-glacier-100 transition-all"
                      >
                        <PenTool className="w-3.5 h-3.5" /> 編輯案件
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm("確定要刪除這個案件嗎？")) {
                            deleteProperty(property.id);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-danger/60 hover:text-danger transition-all"
                      >
                        <Trash2 className="w-3 h-3" /> 刪除案件
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
