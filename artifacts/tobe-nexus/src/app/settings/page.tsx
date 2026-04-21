"use client";

import { useSystemStore } from "@/store/useSystemStore";
import PageHeader from "@/components/PageHeader";
import { User, Sparkles, BarChart3, Phone, ShieldCheck } from "lucide-react";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-titanium-700/40 rounded-md ${className}`} />;
}

export default function SettingsPage() {
  const { currentClient } = useSystemStore();

  const loading = currentClient === null;
  const used = currentClient?.used_this_month ?? 0;
  const quota = currentClient?.monthly_quota ?? 0;
  const usagePct = quota > 0 ? Math.min((used / quota) * 100, 100) : 0;
  const isOverQuota = quota > 0 && used >= quota;
  const remaining = Math.max(quota - used, 0);

  const planLabel: Record<string, string> = {
    basic: 'Basic 方案',
    pro: 'Pro 方案',
    enterprise: 'Enterprise 方案',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="帳號資訊"
        subtitle="查看您的帳號狀態與本月文案用量"
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl space-y-4 lg:space-y-6">

          {/* Client Profile */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-glacier-200/[0.06] bg-titanium-950/30 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-aurora-500/10">
                <User className="w-3.5 h-3.5 text-aurora-500" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-glacier-200">帳號資料</h2>
                <p className="text-[11px] text-glacier-500 mt-0.5">您的帳號基本資訊</p>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <SkeletonBlock className="h-2.5 w-16 mb-2" />
                      <SkeletonBlock className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {[
                    { label: '客戶代碼', value: currentClient?.client_id ?? '—' },
                    { label: '顯示名稱', value: currentClient?.display_name ?? '—' },
                    { label: '方案', value: planLabel[currentClient?.plan_name ?? ''] ?? currentClient?.plan_name ?? '—' },
                    { label: '帳號狀態', value: currentClient?.status === 'active' ? '✓ 正常使用中' : '已停用' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-1">
                        {label}
                      </p>
                      <p className="text-sm font-medium text-glacier-200">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Usage */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-glacier-200/[0.06] bg-titanium-950/30 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-aurora-500/10">
                <BarChart3 className="w-3.5 h-3.5 text-aurora-500" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-glacier-200">本月 AI 文案用量</h2>
                <p className="text-[11px] text-glacier-500 mt-0.5">每月重置，超過上限暫停文案生成</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {loading ? (
                <>
                  <div className="flex items-end gap-2">
                    <SkeletonBlock className="h-10 w-16" />
                    <SkeletonBlock className="h-5 w-20 mb-1" />
                  </div>
                  <div className="space-y-2">
                    <SkeletonBlock className="h-3 w-full rounded-full" />
                    <div className="flex justify-between">
                      <SkeletonBlock className="h-2.5 w-8" />
                      <SkeletonBlock className="h-2.5 w-14" />
                    </div>
                  </div>
                  <SkeletonBlock className="h-12 w-full rounded-xl" />
                </>
              ) : (
                <>
                  {/* Big numbers */}
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-black tabular-nums ${isOverQuota ? 'text-red-500' : 'text-aurora-500'}`}>
                      {used}
                    </span>
                    <span className="text-lg font-bold text-glacier-500 mb-1">/ {quota} 次</span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverQuota ? 'bg-red-500' : usagePct >= 80 ? 'bg-amber-400' : 'bg-aurora-500'
                        }`}
                        style={{ width: `${usagePct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-glacier-500">
                      <span>0 次</span>
                      <span>{quota} 次上限</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                    isOverQuota
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {isOverQuota ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        本月文案配額已用盡，案件管理功能仍可正常使用
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI 文案服務正常 — 本月剩餘 <strong>{remaining}</strong> 次
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* AI Status */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-glacier-200/[0.06] bg-titanium-950/30 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-titanium-700/60">
                <ShieldCheck className="w-3.5 h-3.5 text-glacier-400" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-glacier-200">服務說明</h2>
                <p className="text-[11px] text-glacier-500 mt-0.5">使用規範與保障</p>
              </div>
            </div>

            <div className="p-6 space-y-3 text-xs text-glacier-500 leading-relaxed">
              <p>• 每個帳號有固定月度文案生成次數上限，超過後文案功能暫停，但案件登錄、管理功能照常可用。</p>
              <p>• 配額每月一日自動重置。如有特殊需求，請聯繫您的業務窗口申請調整。</p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-aurora-500/[0.04] border border-aurora-500/15 rounded-xl p-5 flex gap-4">
            <div className="p-2 rounded-lg bg-aurora-500/10 shrink-0 self-start">
              <Phone className="w-4 h-4 text-aurora-500" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-glacier-200 mb-1.5">需要協助？</h3>
              <p className="text-xs text-glacier-500 leading-relaxed">
                如有帳號問題或配額申請，請聯繫您的 TOBE Nexus 業務窗口，我們將在一個工作天內回覆。
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
