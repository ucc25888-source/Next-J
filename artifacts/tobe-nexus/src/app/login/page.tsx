"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Network, Sparkles, LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [loginToken, setLoginToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, login_token: loginToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "登入失敗，請再試一次");
        return;
      }

      if (data.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("網路錯誤，請確認連線後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-titanium-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mb-5 glow-aurora-sm shadow-lg shadow-orange-500/20">
            <Network className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight gradient-brand-text">TOBE Nexus</h1>
          <p className="text-sm text-glacier-500 mt-1 font-medium tracking-wide">
            AI 成交戰略系統
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-aurora-500" />
              <h2 className="text-sm font-bold text-glacier-200">登入您的帳號</h2>
            </div>
            <p className="text-xs text-glacier-500 mt-1">
              輸入業務窗口提供的客戶代碼與存取碼
            </p>
          </div>

          <form onSubmit={handleLogin} className="px-8 py-6 space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">
                客戶代碼 Client ID
              </label>
              <input
                type="text"
                placeholder="A0001"
                value={clientId}
                onChange={(e) => setClientId(e.target.value.toUpperCase())}
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-glacier-200 placeholder-slate-300 focus:outline-none focus:border-aurora-500/60 focus:ring-2 focus:ring-aurora-500/15 transition-all font-mono tracking-wider"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">
                存取碼 Access Code
              </label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  placeholder="由業務窗口提供"
                  value={loginToken}
                  onChange={(e) => setLoginToken(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-glacier-200 placeholder-slate-300 focus:outline-none focus:border-aurora-500/60 focus:ring-2 focus:ring-aurora-500/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !clientId || !loginToken}
              className="w-full flex items-center justify-center gap-2 py-3 gradient-brand text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-aurora-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "登入中..." : "登入系統"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-glacier-600 mt-6">
          TOBE-Nexus Business AI Hub &nbsp;·&nbsp; 全台房仲 AI 成交戰略平台
        </p>
      </div>
    </div>
  );
}
