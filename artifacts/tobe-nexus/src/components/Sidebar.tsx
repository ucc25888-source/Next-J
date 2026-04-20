"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  Settings,
  ChevronRight,
  Zap,
  Activity,
} from "lucide-react";

const navItems = [
  { label: "總覽儀表板", labelEn: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "物件管理", labelEn: "Properties", href: "/properties", icon: Building2 },
  { label: "AI 文案生成", labelEn: "Copywriting", href: "/ai-copy", icon: Sparkles },
  { label: "系統設定", labelEn: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/ai-copy") return pathname.startsWith("/ai-copy") || pathname.startsWith("/generate");
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[220px] flex flex-col bg-titanium-950 border-r border-glacier-200/[0.07] min-h-screen shrink-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-glacier-200/[0.07]">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-aurora-500 flex items-center justify-center shrink-0 glow-aurora-sm">
            <Zap className="w-[18px] h-[18px] text-titanium-950" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-glacier-200 tracking-tight leading-none">
              TOBE-Nexus-AI-System
            </p>
            <p className="text-[9px] font-semibold text-aurora-500 tracking-[0.15em] uppercase mt-1 leading-none">
              AI 成交戰略系統
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 pb-2">
        <span className="text-[9px] font-bold text-glacier-500 tracking-[0.18em] uppercase">Navigation</span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 pb-4">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group relative
                ${active
                  ? "bg-aurora-500/[0.08] text-aurora-400 border border-aurora-500/20"
                  : "text-glacier-400 hover:bg-titanium-700/50 hover:text-glacier-200 border border-transparent"
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-aurora-500 rounded-r-full" />
              )}
              <Icon className={`w-[15px] h-[15px] shrink-0 ${active ? "text-aurora-500" : "text-glacier-500 group-hover:text-glacier-300"}`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 text-aurora-500/60" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-glacier-200/[0.07]">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-titanium-900 border border-glacier-200/[0.06]">
          <Activity className="w-3.5 h-3.5 text-aurora-500" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-glacier-200 truncate">系統運行中</p>
            <p className="text-[9px] text-glacier-500">AI Ready</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-aurora-500 animate-pulse shrink-0" />
        </div>
      </div>
    </aside>
  );
}
