import PageHeader from "@/components/PageHeader";
import { Key, Globe, Shield, ChevronDown } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="系統設定"
        badge="Settings"
        subtitle="管理 API 金鑰、系統偏好與安全設定"
      />

      <main className="flex-1 p-8">
        <div className="max-w-2xl space-y-6">
          {/* OpenAI */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-glacier-200/[0.06] bg-titanium-950/30 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-aurora-500/10">
                <Key className="w-3.5 h-3.5 text-aurora-500" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-glacier-200">
                  OpenAI API 設定
                </h2>
                <p className="text-[11px] text-glacier-500 mt-0.5">
                  設定 API 金鑰以啟用 AI 文案生成功能
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">
                  API 金鑰
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  disabled
                  className="w-full bg-titanium-800/60 border border-glacier-200/[0.06] rounded-lg px-3 py-2.5 text-sm text-glacier-500 placeholder-glacier-600 cursor-not-allowed"
                />
                <p className="mt-2 text-[11px] text-glacier-600 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-aurora-500 inline-block" />
                  請透過 Replit Secrets 設定{" "}
                  <code className="text-aurora-500/80 font-mono bg-titanium-800 px-1.5 py-0.5 rounded text-[10px] border border-aurora-500/15">
                    OPENAI_API_KEY
                  </code>
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">
                  AI 模型
                </label>
                <div className="relative">
                  <select className="w-full appearance-none bg-titanium-800 border border-glacier-200/[0.08] rounded-lg px-3 py-2.5 text-sm text-glacier-200 focus:outline-none focus:border-aurora-500/50 transition-colors">
                    <option>gpt-4o-mini（建議，成本最低）</option>
                    <option>gpt-4o（效果最佳）</option>
                    <option>gpt-4-turbo</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-glacier-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-glacier-200/[0.06] bg-titanium-950/30 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-titanium-700/60">
                <Globe className="w-3.5 h-3.5 text-glacier-400" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-glacier-200">
                  系統語言與地區
                </h2>
                <p className="text-[11px] text-glacier-500 mt-0.5">
                  設定顯示語言與幣別格式
                </p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                {
                  label: "顯示語言",
                  options: ["繁體中文", "English"],
                },
                {
                  label: "幣別格式",
                  options: ["新台幣 (TWD)", "人民幣 (CNY)", "美元 (USD)"],
                },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">
                    {field.label}
                  </label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-titanium-800 border border-glacier-200/[0.08] rounded-lg px-3 py-2.5 text-sm text-glacier-200 focus:outline-none focus:border-aurora-500/50 transition-colors">
                      {field.options.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-glacier-500 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-aurora-500/[0.04] border border-aurora-500/15 rounded-xl p-5 flex gap-4">
            <div className="p-2 rounded-lg bg-aurora-500/10 shrink-0 self-start">
              <Shield className="w-4 h-4 text-aurora-500" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-glacier-200 mb-1.5">
                安全性說明
              </h3>
              <p className="text-xs text-glacier-500 leading-relaxed">
                為確保 API 金鑰安全，請勿將金鑰直接寫入程式碼。請使用{" "}
                <strong className="text-glacier-400">Replit Secrets</strong> 功能（左側欄位 → Secrets）設定環境變數{" "}
                <code className="text-aurora-400 font-mono bg-titanium-900 px-1.5 py-0.5 rounded text-[10px] border border-aurora-500/15">
                  OPENAI_API_KEY
                </code>
                ，系統將自動載入，確保金鑰不外洩。
              </p>
            </div>
          </div>

          <button className="px-6 py-2.5 bg-aurora-500 text-titanium-950 text-sm font-bold rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm">
            儲存設定
          </button>
        </div>
      </main>
    </div>
  );
}
