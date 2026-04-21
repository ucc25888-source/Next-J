"use client";

import Link from "next/link";
import { usePropertyStore } from "@/store/usePropertyStore";
import PageHeader from "@/components/PageHeader";
import { Sparkles, Building2, ArrowRight, Plus } from "lucide-react";
import { getAreaDisplayCompact } from "@/utils/areaDisplay";

export default function AiCopyPage() {
  const properties = usePropertyStore((s) => s.properties);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="AI 文案生成"
        badge="Copywriting"
        subtitle="選擇一個物件，AI 自動生成 Facebook 房產銷售文案"
      />

      <main className="flex-1 p-8 space-y-6">
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-titanium-900 border-2 border-dashed border-glacier-200/[0.08] rounded-xl">
            <div className="w-16 h-16 rounded-2xl bg-aurora-500/10 border border-aurora-500/20 flex items-center justify-center mb-5">
              <Building2 className="w-7 h-7 text-aurora-500/60" />
            </div>
            <p className="text-sm font-semibold text-glacier-400">尚無物件可生成文案</p>
            <p className="text-xs text-glacier-600 mt-1.5 max-w-xs text-center">
              請先在「物件管理」中新增物件，系統將根據物件資訊生成 AI 文案
            </p>
            <Link
              href="/properties/new"
              className="mt-5 flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm"
            >
              <Plus className="w-4 h-4" /> 新增第一個物件
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-glacier-500">
              選擇要生成文案的物件（共 {properties.length} 件）：
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => {
                const title = `${property.listing_id ? `[${property.listing_id}] ` : ""}${property.subarea} ${property.property_type}`;
                return (
                  <Link
                    key={property.id}
                    href={`/generate/${property.id}`}
                    translate="no"
                    className="group flex bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden hover:border-aurora-500/25 transition-all duration-200"
                  >
                    <div className="w-24 h-24 shrink-0 bg-titanium-800 overflow-hidden">
                      <img
                        src={property.img1_url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400"}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div>
                        <p className="text-[12px] font-bold text-glacier-200 truncate">{title}</p>
                        <p className="text-xs text-glacier-500 mt-0.5">
                          {property.rooms}房{property.halls}廳 · {getAreaDisplayCompact(property.property_type, property.build_ping, property.land_ping)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-aurora-500">
                          {property.price_wan?.toLocaleString()} 萬
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-aurora-500 group-hover:gap-2 transition-all">
                          <Sparkles className="w-3 h-3" /> 生成文案
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
