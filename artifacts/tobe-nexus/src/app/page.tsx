import PageHeader from "@/components/PageHeader";
import {
  Building2,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowUpRight,
  FileText,
  ChevronRight,
} from "lucide-react";

const stats = [
  {
    label: "總物件數",
    labelEn: "Total Properties",
    value: "0",
    sub: "尚無物件",
    icon: Building2,
    accent: true,
  },
  {
    label: "AI 文案生成",
    labelEn: "AI Copies Generated",
    value: "0",
    sub: "本月生成次數",
    icon: Sparkles,
    accent: true,
  },
  {
    label: "成交率",
    labelEn: "Conversion Rate",
    value: "—",
    sub: "待數據累積",
    icon: TrendingUp,
    accent: false,
  },
  {
    label: "最近活動",
    labelEn: "Recent Activity",
    value: "—",
    sub: "尚無操作紀錄",
    icon: Clock,
    accent: false,
  },
];

const quickActions = [
  {
    label: "新增物件",
    desc: "登錄新的房產物件資訊",
    href: "/properties",
    icon: Building2,
  },
  {
    label: "生成 AI 文案",
    desc: "一鍵生成 Facebook 銷售文案",
    href: "/ai-copy",
    icon: Sparkles,
  },
  {
    label: "查看報告",
    desc: "分析銷售數據與業績趨勢",
    href: "#",
    icon: FileText,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="總覽儀表板"
        badge="Dashboard"
        subtitle="TOBE-Nexus · 商業總部的 AI 戰略樞紐"
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
                  stat.accent
                    ? "border-aurora-500/15 hover:border-aurora-500/30"
                    : "border-glacier-200/[0.06] hover:border-glacier-200/[0.12]"
                }`}
              >
                {stat.accent && (
                  <div className="absolute inset-0 rounded-xl bg-aurora-500/[0.03] pointer-events-none" />
                )}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      stat.accent
                        ? "bg-aurora-500/10"
                        : "bg-titanium-700/60"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${stat.accent ? "text-aurora-500" : "text-glacier-500"}`}
                    />
                  </div>
                </div>
                <p className="text-2xl font-bold text-glacier-200 leading-none">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs font-semibold text-glacier-400">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-[10px] text-glacier-500">{stat.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-glacier-500 tracking-[0.15em] uppercase">
                快捷操作
              </p>
            </div>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-4 bg-titanium-900 border border-glacier-200/[0.06] rounded-xl p-4 hover:border-aurora-500/25 hover:bg-titanium-900/80 transition-all duration-200 group"
                >
                  <div className="p-2.5 rounded-xl bg-aurora-500/10 border border-aurora-500/15 group-hover:bg-aurora-500/15 transition-colors shrink-0">
                    <Icon className="w-4 h-4 text-aurora-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-glacier-200 group-hover:text-aurora-400 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-glacier-500 mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-glacier-600 group-hover:text-aurora-500 transition-colors shrink-0" />
                </a>
              );
            })}
          </div>

          {/* System Status */}
          <div className="bg-titanium-900 border border-glacier-200/[0.06] rounded-xl p-5">
            <p className="text-[10px] font-bold text-glacier-500 tracking-[0.15em] uppercase mb-4">
              系統狀態
            </p>
            <div className="space-y-3">
              {[
                { label: "AI 引擎", status: "待設定 API", ok: false },
                { label: "物件資料庫", status: "就緒", ok: true },
                { label: "文案模組", status: "就緒", ok: true },
                { label: "OpenAI 連線", status: "待設定 KEY", ok: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-glacier-400">{item.label}</span>
                  <span
                    className={`flex items-center gap-1.5 text-[10px] font-medium ${
                      item.ok ? "text-aurora-500" : "text-glacier-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${item.ok ? "bg-aurora-500" : "bg-glacier-600"}`}
                    />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-glacier-200/[0.06]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-glacier-500">系統版本</p>
                <p className="text-[10px] font-mono text-glacier-400">v1.0.0</p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-glacier-500">AI 模型</p>
                <p className="text-[10px] font-mono text-glacier-400">gpt-4o-mini</p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="relative bg-titanium-900 border border-aurora-500/15 rounded-xl p-6 overflow-hidden">
          <div className="absolute inset-0 bg-aurora-500/[0.03] pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-aurora-500/10 border border-aurora-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-aurora-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-glacier-200">
                  TOBE-Nexus 基礎架構就緒
                </h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-aurora-500/15 text-aurora-500 font-bold tracking-wider border border-aurora-500/20">
                  READY
                </span>
              </div>
              <p className="mt-1.5 text-xs text-glacier-500 leading-relaxed max-w-2xl">
                系統已完成初始化。請在 Replit Secrets 中設定{" "}
                <code className="px-1.5 py-0.5 bg-titanium-700 text-aurora-400 rounded text-[11px] font-mono border border-aurora-500/20">
                  OPENAI_API_KEY
                </code>{" "}
                以啟用 AI 文案生成功能。待您上傳原有物件資料後，系統將自動完成整合。
              </p>
            </div>
            <a
              href="/settings"
              className="flex items-center gap-1.5 text-xs text-aurora-500 font-semibold hover:text-aurora-400 transition-colors shrink-0 mt-0.5"
            >
              前往設定 <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
