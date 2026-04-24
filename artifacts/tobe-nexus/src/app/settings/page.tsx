"use client";

import { useState } from "react";
import { useSystemStore } from "@/store/useSystemStore";
import PageHeader from "@/components/PageHeader";
import {
  User, Sparkles, BarChart3, Phone, ShieldCheck,
  MessageSquare, Eye, EyeOff, Check, Loader2, Lock, KeyRound,
} from "lucide-react";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-titanium-700/40 rounded-md ${className}`} />;
}

export default function SettingsPage() {
  const { currentClient, setCurrentClient } = useSystemStore();

  const loading = currentClient === null;
  const used    = currentClient?.used_this_month ?? 0;
  const quota   = currentClient?.monthly_quota ?? 0;
  const usagePct  = quota > 0 ? Math.min((used / quota) * 100, 100) : 0;
  const isOverQuota = quota > 0 && used >= quota;
  const remaining = Math.max(quota - used, 0);

  const planLabel: Record<string, string> = {
    basic: 'Basic 方案', pro: 'Pro 方案', enterprise: 'Enterprise 方案',
  };

  /* ── Change password state ── */
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleChangePwd = async () => {
    if (!curPwd || !newPwd || !confirmPwd) { setPwdMsg({ ok: false, text: '請填寫所有欄位' }); return; }
    if (newPwd !== confirmPwd) { setPwdMsg({ ok: false, text: '新存取碼與確認碼不一致' }); return; }
    if (newPwd.length < 6) { setPwdMsg({ ok: false, text: '新存取碼至少需要 6 個字元' }); return; }
    setPwdSaving(true); setPwdMsg(null);
    const res = await fetch('/api/auth/change-password', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: curPwd, new_password: newPwd }),
    });
    const data = await res.json();
    setPwdSaving(false);
    if (res.ok) {
      setPwdMsg({ ok: true, text: '存取碼已更新，下次登入請使用新存取碼' });
      setCurPwd(""); setNewPwd(""); setConfirmPwd("");
    } else {
      setPwdMsg({ ok: false, text: data.error ?? '更新失敗，請稍後再試' });
    }
  };

  /* ── LINE token state ── */
  const [lineToken, setLineToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [lineSaving, setLineSaving] = useState(false);
  const [lineSaved, setLineSaved] = useState(false);
  const [lineError, setLineError] = useState("");

  const hasLine = currentClient?.has_line_service ?? false;
  const savedToken = currentClient?.line_notify_token ?? "";

  const handleSaveToken = async () => {
    const tok = lineToken.trim();
    if (!tok) { setLineError("請輸入 LINE Notify Token"); return; }
    setLineSaving(true); setLineError("");
    const res = await fetch("/api/settings/line-token", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: tok }),
    });
    setLineSaving(false);
    if (res.ok) {
      setLineSaved(true);
      if (currentClient) setCurrentClient({ ...currentClient, line_notify_token: tok });
      setLineToken("");
      setTimeout(() => setLineSaved(false), 3000);
    } else {
      setLineError("儲存失敗，請稍後再試");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="帳號資訊" subtitle="查看您的帳號狀態與本月文案用量" />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl space-y-4 lg:space-y-6">

          {/* ── Client Profile ── */}
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
                    <div key={i}><SkeletonBlock className="h-2.5 w-16 mb-2" /><SkeletonBlock className="h-4 w-28" /></div>
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
                      <p className="text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-1">{label}</p>
                      <p className="text-sm font-medium text-glacier-200">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Monthly Usage ── */}
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
                    <div className="flex justify-between"><SkeletonBlock className="h-2.5 w-8" /><SkeletonBlock className="h-2.5 w-14" /></div>
                  </div>
                  <SkeletonBlock className="h-12 w-full rounded-xl" />
                </>
              ) : (
                <>
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-black tabular-nums ${isOverQuota ? 'text-red-500' : 'text-aurora-500'}`}>{used}</span>
                    <span className="text-lg font-bold text-glacier-500 mb-1">/ {quota} 次</span>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${isOverQuota ? 'bg-red-500' : usagePct >= 80 ? 'bg-amber-400' : 'bg-aurora-500'}`}
                        style={{ width: `${usagePct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-glacier-500">
                      <span>0 次</span><span>{quota} 次上限</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                    isOverQuota ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                    {isOverQuota ? '本月文案配額已用盡，案件管理功能仍可正常使用' : <>AI 文案服務正常 — 本月剩餘 <strong>{remaining}</strong> 次</>}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── LINE 加值服務 ── */}
          <div className={`rounded-xl overflow-hidden border ${
            hasLine
              ? 'bg-titanium-900 border-emerald-500/20'
              : 'bg-titanium-900 border-glacier-200/[0.07]'
          }`}>
            <div className="px-6 py-4 border-b border-glacier-200/[0.06] bg-titanium-950/30 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${hasLine ? 'bg-emerald-500/10' : 'bg-titanium-700/60'}`}>
                <MessageSquare className={`w-3.5 h-3.5 ${hasLine ? 'text-emerald-400' : 'text-glacier-500'}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-[13px] font-bold text-glacier-200 flex items-center gap-2">
                  LINE@ 每日重點提醒
                  {hasLine ? (
                    <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">加值服務已開啟</span>
                  ) : (
                    <span className="text-[9px] font-black bg-titanium-700/60 text-glacier-500 border border-glacier-200/[0.08] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> 加值服務專屬
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-glacier-500 mt-0.5">每日 10:00 & 16:00 自動推播每日重點至您的個人 LINE</p>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <SkeletonBlock className="h-16 w-full rounded-xl" />
              ) : !hasLine ? (
                /* ── 未開啟：說明卡片 ── */
                <div className="space-y-4">
                  <div className="bg-titanium-800/50 rounded-xl p-4 space-y-2.5 text-xs text-glacier-500 leading-relaxed">
                    <p className="font-bold text-glacier-400">客製化 LINE@ 每日重點提醒</p>
                    <p>• 每日自動整理您的「待回訪」、「帶看後續」、「委託到期」等重要任務</p>
                    <p>• 精準發送至您的個人 LINE，不漏接任何客戶追蹤</p>
                    <p>• 採用 LINE Notify 技術，設定簡便，支援個人帳號與官方帳號</p>
                  </div>
                  <p className="text-xs text-glacier-600">
                    如需開通此加值服務，請聯繫您的 TOBE Nexus 業務窗口申請。
                  </p>
                </div>
              ) : (
                /* ── 已開啟：Token 設定介面 ── */
                <div className="space-y-5">
                  {/* 目前狀態 */}
                  <div className={`flex items-center gap-3 p-3.5 rounded-xl text-xs ${
                    savedToken
                      ? 'bg-emerald-500/[0.06] border border-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/[0.06] border border-amber-500/15 text-amber-400'
                  }`}>
                    {savedToken ? (
                      <><Check className="w-3.5 h-3.5 shrink-0" /> LINE Notify Token 已設定，每日推播已啟用</>
                    ) : (
                      <><MessageSquare className="w-3.5 h-3.5 shrink-0" /> 尚未設定 Token，請填入下方欄位以啟用每日推播</>
                    )}
                  </div>

                  {/* Token 輸入 */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em]">
                      LINE Notify Personal Token
                    </label>
                    <div className="relative">
                      <input
                        type={showToken ? "text" : "password"}
                        value={lineToken}
                        onChange={(e) => setLineToken(e.target.value)}
                        placeholder={savedToken ? "輸入新 Token 以更新……" : "貼入您的 LINE Notify Token……"}
                        className="w-full bg-titanium-800 border border-glacier-200/[0.1] rounded-lg px-3 pr-10 py-2.5 text-sm text-glacier-200 placeholder:text-glacier-600 focus:outline-none focus:border-aurora-500/40 transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-glacier-600 hover:text-glacier-300 transition-colors"
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {lineError && <p className="text-[11px] text-red-400">{lineError}</p>}
                    {lineSaved && <p className="text-[11px] text-emerald-400">✓ Token 已儲存，每日推播已更新</p>}
                  </div>

                  <button
                    onClick={handleSaveToken}
                    disabled={lineSaving || !lineToken.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {lineSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {lineSaving ? '儲存中……' : '儲存 Token'}
                  </button>

                  {/* 取得 Token 說明 */}
                  <div className="border-t border-glacier-200/[0.06] pt-4 space-y-1.5 text-[11px] text-glacier-600">
                    <p className="font-bold text-glacier-500">如何取得 LINE Notify Token？</p>
                    <p>1. 前往 <span className="text-aurora-400 font-mono">notify.line.me/my</span> 並登入您的 LINE 帳號</p>
                    <p>2. 點擊「發行 token」，選擇傳送至「透過 1 對 1 聊天接收 LINE Notify 的通知」</p>
                    <p>3. 複製產生的 token，貼入上方欄位後儲存</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Service Notes ── */}
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

          {/* ── Change Password ── */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-glacier-200/[0.06] bg-titanium-950/30 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-aurora-500/10">
                <KeyRound className="w-3.5 h-3.5 text-aurora-500" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-glacier-200">修改存取碼</h2>
                <p className="text-[11px] text-glacier-500 mt-0.5">更新您的登入密碼，至少 6 個字元</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: '目前存取碼', value: curPwd, setter: setCurPwd, show: showCur, toggle: () => setShowCur(p => !p) },
                { label: '新存取碼', value: newPwd, setter: setNewPwd, show: showNew, toggle: () => setShowNew(p => !p) },
                { label: '確認新存取碼', value: confirmPwd, setter: setConfirmPwd, show: showNew, toggle: () => setShowNew(p => !p) },
              ].map(({ label, value, setter, show, toggle }) => (
                <div key={label}>
                  <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-1">{label}</label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={label === '目前存取碼' ? '輸入目前的存取碼' : '輸入新存取碼（至少 6 碼）'}
                      className="w-full bg-titanium-800 border border-glacier-200/[0.1] rounded-lg px-3 pr-10 py-2.5 text-sm text-glacier-200 placeholder:text-glacier-600 focus:outline-none focus:border-aurora-500/40 transition-colors"
                    />
                    <button type="button" onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-glacier-600 hover:text-glacier-300 transition-colors">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              {pwdMsg && (
                <p className={`text-[11px] ${pwdMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pwdMsg.ok ? '✓ ' : '✗ '}{pwdMsg.text}
                </p>
              )}
              <button onClick={handleChangePwd} disabled={pwdSaving || !curPwd || !newPwd || !confirmPwd}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-aurora-500 text-titanium-950 hover:bg-aurora-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {pwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {pwdSaving ? '更新中……' : '更新存取碼'}
              </button>
            </div>
          </div>

          {/* ── Contact ── */}
          <div className="bg-aurora-500/[0.04] border border-aurora-500/15 rounded-xl p-5 flex gap-4">
            <div className="p-2 rounded-lg bg-aurora-500/10 shrink-0 self-start">
              <Phone className="w-4 h-4 text-aurora-500" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-glacier-200 mb-1.5">需要協助？</h3>
              <p className="text-xs text-glacier-500 leading-relaxed">
                如有帳號問題、配額申請或 LINE 加值服務開通，請聯繫您的 TOBE Nexus 業務窗口，我們將在一個工作天內回覆。
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
