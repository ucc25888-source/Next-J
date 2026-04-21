"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, BarChart3, Sparkles, ShieldOff, ShieldCheck,
  Plus, LogOut, RefreshCw, Network, PencilLine, X, Check, RotateCcw,
  Activity, FileText, Zap, Download, DatabaseBackup, Building2,
  UserRound, CalendarCheck, Bot,
} from "lucide-react";

interface AdminClient {
  client_id: string;
  display_name: string;
  plan_name: string;
  monthly_quota: number;
  used_this_month: number;
  status: string;
  created_at: string;
  property_count: number;
  total_copies: number;
  has_line_service: boolean;
  line_notify_token: string | null;
}

interface NewClientForm {
  client_id: string;
  display_name: string;
  login_token: string;
  plan_name: string;
  monthly_quota: number;
}

interface AiLog {
  id: number;
  client_id: string;
  display_name: string;
  action: string;
  property_id: string | null;
  tokens_used: number;
  created_at: string;
}

interface UsageSummary {
  client_id: string;
  display_name: string;
  gen_count: number;
  total_tokens: number;
}

const PLAN_LABELS: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const CHART_COLORS = [
  '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316',
];

function formatLogTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).replace(/\//g, '/');
}

/* ── Simple SVG bar chart ── */
function UsageBarChart({ summary, total }: { summary: UsageSummary[]; total: number }) {
  if (summary.length === 0) return (
    <div className="flex items-center justify-center h-32 text-slate-400 text-sm">本月尚無生成記錄</div>
  );

  const max = Math.max(...summary.map((s) => s.gen_count), 1);
  const barW = 48;
  const gap = 24;
  const chartH = 100;
  const svgW = summary.length * (barW + gap) + gap;

  return (
    <div className="overflow-x-auto">
      <svg width={svgW} height={chartH + 56} className="block mx-auto">
        {summary.map((s, i) => {
          const h = Math.max((s.gen_count / max) * chartH, 4);
          const x = gap + i * (barW + gap);
          const y = chartH - h;
          const color = CHART_COLORS[i % CHART_COLORS.length];
          return (
            <g key={s.client_id}>
              <rect x={x} y={y} width={barW} height={h} rx={6} fill={color} opacity={0.85} />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight="bold" fill={color}>
                {s.gen_count}次
              </text>
              <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize={10} fill="#64748b">
                {s.display_name.slice(0, 5)}
              </text>
              <text x={x + barW / 2} y={chartH + 30} textAnchor="middle" fontSize={9} fill="#94a3b8">
                {s.total_tokens.toLocaleString()}T
              </text>
            </g>
          );
        })}
        <line x1={0} y1={chartH} x2={svgW} y2={chartH} stroke="#e2e8f0" strokeWidth={1} />
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 px-2">
        {summary.map((s, i) => (
          <div key={s.client_id} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="text-xs text-slate-600 font-medium">{s.display_name}</span>
            <span className="text-xs text-slate-400">({Math.round((s.gen_count / Math.max(total, 1)) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Donut gauge for overall usage ── */
function QuotaGauge({ used, quota }: { used: number; quota: number }) {
  const pct = quota > 0 ? Math.min(used / quota, 1) : 0;
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);
  const color = pct >= 1 ? '#ef4444' : pct >= 0.8 ? '#f59e0b' : '#10b981';

  return (
    <div className="flex flex-col items-center">
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={60} cy={60} r={r} fill="none" stroke="#f1f5f9" strokeWidth={12} />
        <circle cx={60} cy={60} r={r} fill="none" stroke={color} strokeWidth={12}
          strokeDasharray={circ} strokeDashoffset={dashOffset}
          strokeLinecap="round" transform="rotate(-90 60 60)" />
        <text x={60} y={56} textAnchor="middle" fontSize={18} fontWeight="900" fill={color}>
          {Math.round(pct * 100)}%
        </text>
        <text x={60} y={72} textAnchor="middle" fontSize={10} fill="#94a3b8">
          已使用
        </text>
      </svg>
      <p className="text-sm font-bold text-slate-700 mt-1">{used} / {quota} 次</p>
      <p className="text-xs text-slate-400">本月全體用量</p>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'clients' | 'monitor' | 'export'>('clients');
  const [exportingTable, setExportingTable] = useState<string | null>(null);
  const [exportClientMap, setExportClientMap] = useState<Record<string, string>>({
    properties: 'ALL', buyers: 'ALL', showings: 'ALL', ai_logs: 'ALL',
  });
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuota, setEditQuota] = useState<number>(30);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState<NewClientForm>({
    client_id: '', display_name: '', login_token: '', plan_name: 'basic', monthly_quota: 30,
  });
  const [addLoading, setAddLoading] = useState(false);

  const [logs, setLogs] = useState<AiLog[]>([]);
  const [logSummary, setLogSummary] = useState<UsageSummary[]>([]);
  const [quotaInfo, setQuotaInfo] = useState({ total_quota: 0, total_used: 0 });
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clients');
      if (res.status === 403) { router.push('/'); return; }
      const data = await res.json();
      setClients(data.clients ?? []);
    } finally { setLoading(false); }
  }, [router]);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        const d = await res.json();
        setLogs(d.logs ?? []);
        setLogSummary(d.summary ?? []);
        setQuotaInfo(d.quota ?? { total_quota: 0, total_used: 0 });
      }
    } finally { setLogsLoading(false); }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);
  useEffect(() => { if (activeTab === 'monitor') fetchLogs(); }, [activeTab, fetchLogs]);

  const handleToggleStatus = async (client: AdminClient) => {
    const newStatus = client.status === 'active' ? 'suspended' : 'active';
    await fetch(`/api/admin/clients/${client.client_id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setClients(clients.map(c => c.client_id === client.client_id ? { ...c, status: newStatus } : c));
  };

  const handleSaveQuota = async (clientId: string) => {
    await fetch(`/api/admin/clients/${clientId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_quota: editQuota }),
    });
    setClients(clients.map(c => c.client_id === clientId ? { ...c, monthly_quota: editQuota } : c));
    setEditingId(null);
  };

  const handleResetUsage = async (clientId: string) => {
    await fetch(`/api/admin/clients/${clientId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_usage: true }),
    });
    setClients(clients.map(c => c.client_id === clientId ? { ...c, used_this_month: 0 } : c));
  };

  const handleToggleLine = async (client: AdminClient) => {
    const newVal = !client.has_line_service;
    await fetch(`/api/admin/clients/${client.client_id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ has_line_service: newVal }),
    });
    setClients(clients.map(c => c.client_id === client.client_id ? { ...c, has_line_service: newVal } : c));
  };

  const handleAddClient = async () => {
    if (!newClient.client_id || !newClient.display_name || !newClient.login_token) return;
    setAddLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${newClient.client_id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewClient({ client_id: '', display_name: '', login_token: '', plan_name: 'basic', monthly_quota: 30 });
        await fetchClients();
      }
    } finally { setAddLoading(false); }
  };

  const handleExport = async (table: string, clientId?: string) => {
    const target = clientId ?? exportClientMap[table] ?? 'ALL';
    setExportingTable(table);
    try {
      const res = await fetch(`/api/admin/export/${table}?client=${target}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`匯出失敗：${err.error ?? '請稍後再試'}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const now = new Date().toLocaleDateString('zh-TW').replace(/\//g, '');
      const label = target === 'ALL' ? '全部' : target;
      a.download = `TOBE_${table}_${label}_${now}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setExportingTable(null); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const totalUsed = clients.reduce((acc, c) => acc + (c.used_this_month ?? 0), 0);
  const activeCount = clients.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-screen bg-titanium-800">
      {/* Top bar */}
      <div className="bg-titanium-950 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-aurora-500 flex items-center justify-center glow-aurora-sm">
            <Network className="w-4 h-4 text-titanium-950" />
          </div>
          <div>
            <p className="text-[12px] font-black text-white leading-none">TOBE Nexus</p>
            <p className="text-[10px] text-aurora-400 mt-0.5 font-medium">管理員後台</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-titanium-900 border border-white/[0.06] rounded-xl p-1">
          {([
            { key: 'clients', label: '客戶管理', icon: Users },
            { key: 'monitor', label: 'AI 使用監控', icon: Activity },
            { key: 'export', label: '資料匯出', icon: DatabaseBackup },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === key
                  ? 'bg-aurora-500 text-titanium-950 glow-aurora-sm'
                  : 'text-glacier-400 hover:text-glacier-200'
              }`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]">
          <LogOut className="w-3.5 h-3.5" /> 登出
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ═══ TAB: 客戶管理 ═══ */}
        {activeTab === 'clients' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users, label: '活躍客戶', value: activeCount, total: clients.length, color: 'text-aurora-500' },
                { icon: BarChart3, label: '本月累計文案', value: totalUsed, unit: '次', color: 'text-blue-400' },
                { icon: Sparkles, label: '客戶總案件', value: clients.reduce((a, c) => a + c.property_count, 0), unit: '件', color: 'text-emerald-400' },
              ].map(({ icon: Icon, label, value, total, unit, color }) => (
                <div key={label} className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl px-6 py-5">
                  <Icon className={`w-5 h-5 ${color} mb-3`} />
                  <p className={`text-3xl font-black ${color} tabular-nums`}>
                    {value}{total !== undefined ? <span className="text-base font-medium text-glacier-500">/{total}</span> : ''}
                    {unit && <span className="text-base font-medium text-glacier-500 ml-1">{unit}</span>}
                  </p>
                  <p className="text-xs text-glacier-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Client Table */}
            <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-glacier-200/[0.06] bg-titanium-950/30 flex items-center justify-between">
                <h2 className="text-[13px] font-bold text-glacier-200">客戶管理</h2>
                <div className="flex gap-2">
                  <button onClick={fetchClients}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-glacier-400 hover:text-glacier-200 border border-glacier-200/[0.08] rounded-lg transition-all">
                    <RefreshCw className="w-3 h-3" /> 重新整理
                  </button>
                  <button onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm">
                    <Plus className="w-3.5 h-3.5" /> 新增客戶
                  </button>
                </div>
              </div>

              {showAddForm && (
                <div className="px-6 py-5 border-b border-aurora-500/20 bg-aurora-500/[0.03]">
                  <p className="text-[11px] font-bold text-aurora-400 uppercase tracking-[0.12em] mb-4">新增客戶帳號</p>
                  <p className="text-[10px] text-glacier-500 mb-3">
                    ⚠ A0001 為測試帳號，正式客戶請從 <span className="font-mono text-aurora-400">A1001</span> 開始編號
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { label: '客戶代碼', key: 'client_id', placeholder: 'A1001', mono: true },
                      { label: '顯示名稱', key: 'display_name', placeholder: '陳仲介' },
                      { label: '存取碼', key: 'login_token', placeholder: 'A1001-2026' },
                    ].map(({ label, key, placeholder, mono }) => (
                      <div key={key}>
                        <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.1em] mb-1">{label}</label>
                        <input type="text" placeholder={placeholder}
                          value={newClient[key as keyof NewClientForm] as string}
                          onChange={(e) => setNewClient({ ...newClient, [key]: key === 'client_id' ? e.target.value.toUpperCase() : e.target.value })}
                          className={`w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-glacier-200 focus:outline-none focus:border-aurora-500/50 transition-colors ${mono ? 'font-mono' : ''}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.1em] mb-1">方案</label>
                      <select value={newClient.plan_name} onChange={(e) => setNewClient({ ...newClient, plan_name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-glacier-200 focus:outline-none">
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.1em] mb-1">月配額（次）</label>
                      <input type="number" min={1} value={newClient.monthly_quota}
                        onChange={(e) => setNewClient({ ...newClient, monthly_quota: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-glacier-200 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddClient} disabled={addLoading || !newClient.client_id || !newClient.display_name || !newClient.login_token}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 disabled:opacity-50 transition-all">
                      <Check className="w-3.5 h-3.5" /> {addLoading ? '新增中...' : '確認新增'}
                    </button>
                    <button onClick={() => setShowAddForm(false)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm text-glacier-500 border border-glacier-200/[0.1] rounded-lg hover:text-glacier-300 transition-all">
                      <X className="w-3.5 h-3.5" /> 取消
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="px-6 py-12 text-center text-glacier-500 text-sm">載入中...</div>
              ) : clients.length === 0 ? (
                <div className="px-6 py-12 text-center text-glacier-500 text-sm">尚無客戶</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glacier-200/[0.05]">
                        {['客戶代碼', '名稱', '方案', '本月用量', '案件數', '狀態', 'LINE', '操作'].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-glacier-500 uppercase tracking-[0.1em]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glacier-200/[0.04]">
                      {clients.map((c) => {
                        const usagePct = Math.min((c.used_this_month / c.monthly_quota) * 100, 100);
                        const isOver = c.used_this_month >= c.monthly_quota;
                        return (
                          <tr key={c.client_id} className="hover:bg-titanium-800/30 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs font-bold text-aurora-400">{c.client_id}</td>
                            <td className="px-6 py-4 font-medium text-glacier-200">{c.display_name}</td>
                            <td className="px-6 py-4 text-glacier-400 text-xs">{PLAN_LABELS[c.plan_name] ?? c.plan_name}</td>
                            <td className="px-6 py-4">
                              {editingId === c.client_id ? (
                                <div className="flex items-center gap-2">
                                  <input type="number" min={1} value={editQuota} onChange={(e) => setEditQuota(Number(e.target.value))}
                                    className="w-20 bg-white border border-aurora-500/40 rounded px-2 py-1 text-xs text-glacier-200 focus:outline-none" />
                                  <button onClick={() => handleSaveQuota(c.client_id)} className="text-aurora-500 hover:text-aurora-400"><Check className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => setEditingId(null)} className="text-glacier-500 hover:text-glacier-300"><X className="w-3.5 h-3.5" /></button>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium tabular-nums ${isOver ? 'text-red-400' : 'text-aurora-400'}`}>
                                      {c.used_this_month} / {c.monthly_quota}
                                    </span>
                                    <button onClick={() => { setEditingId(c.client_id); setEditQuota(c.monthly_quota); }}
                                      className="text-glacier-600 hover:text-aurora-400 transition-colors" title="修改配額上限">
                                      <PencilLine className="w-3 h-3" />
                                    </button>
                                    {isOver && (
                                      <button onClick={() => handleResetUsage(c.client_id)}
                                        className="text-amber-500 hover:text-amber-400 transition-colors" title="重置本月用量">
                                        <RotateCcw className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="w-24 h-1 bg-titanium-700 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : usagePct >= 80 ? 'bg-amber-400' : 'bg-aurora-500'}`}
                                      style={{ width: `${usagePct}%` }} />
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-glacier-400 text-xs tabular-nums">{c.property_count} 件</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {c.status === 'active' ? '正常' : '已停用'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleLine(c)}
                                title={c.has_line_service ? '點擊關閉 LINE 加值服務' : '點擊開啟 LINE 加值服務'}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                  c.has_line_service ? 'bg-emerald-500' : 'bg-titanium-600'
                                }`}>
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                  c.has_line_service ? 'translate-x-4' : 'translate-x-1'
                                }`} />
                              </button>
                              {c.line_notify_token && (
                                <span className="block text-[9px] text-emerald-400 mt-0.5 font-mono">token 已設定</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => handleToggleStatus(c)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                  c.status === 'active'
                                    ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                                    : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                                }`}>
                                {c.status === 'active'
                                  ? <><ShieldOff className="w-3 h-3" /> 停用 AI</>
                                  : <><ShieldCheck className="w-3 h-3" /> 恢復</>}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══ TAB: AI 使用監控 ═══ */}
        {activeTab === 'monitor' && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-glacier-500 font-medium">本月 API 消耗統計（單一出口 · 共用金鑰）</p>
              <button onClick={fetchLogs} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-glacier-400 hover:text-glacier-200 border border-glacier-200/[0.08] rounded-lg transition-all">
                <RefreshCw className={`w-3 h-3 ${logsLoading ? 'animate-spin' : ''}`} /> 刷新
              </button>
            </div>

            {/* Summary cards + donut */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 bg-titanium-900 border border-glacier-200/[0.07] rounded-xl p-6 flex items-center justify-center">
                <QuotaGauge used={quotaInfo.total_used} quota={quotaInfo.total_quota} />
              </div>

              <div className="md:col-span-2 bg-titanium-900 border border-glacier-200/[0.07] rounded-xl p-6">
                <p className="text-[11px] font-black text-glacier-400 uppercase tracking-[0.12em] mb-4">
                  各帳號消耗量（本月）
                </p>
                {logsLoading ? (
                  <div className="h-32 bg-titanium-800 rounded-lg animate-pulse" />
                ) : (
                  <UsageBarChart summary={logSummary} total={logSummary.reduce((a, s) => a + s.gen_count, 0)} />
                )}
              </div>
            </div>

            {/* Per-user stat chips */}
            {logSummary.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {logSummary.map((s, i) => (
                  <div key={s.client_id} className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl px-4 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <p className="text-xs font-bold text-glacier-300 truncate">{s.display_name}</p>
                    </div>
                    <p className="text-2xl font-black text-white tabular-nums">{s.gen_count}</p>
                    <p className="text-[10px] text-glacier-500 mt-0.5">生成次數</p>
                    <p className="text-xs text-glacier-400 mt-1 tabular-nums">{s.total_tokens.toLocaleString()} tokens</p>
                  </div>
                ))}
              </div>
            )}

            {/* AI Log list */}
            <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-glacier-200/[0.06] bg-titanium-950/30 flex items-center gap-2">
                <FileText className="w-4 h-4 text-aurora-400" />
                <h2 className="text-[13px] font-bold text-glacier-200">本月 AI 執行日誌</h2>
                <span className="ml-auto text-[10px] text-glacier-500">{logs.length} 筆記錄</span>
              </div>
              {logsLoading ? (
                <div className="p-6 space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-titanium-800 rounded animate-pulse" />)}
                </div>
              ) : logs.length === 0 ? (
                <div className="px-6 py-10 text-center text-glacier-500 text-sm">本月尚無生成記錄</div>
              ) : (
                <div className="divide-y divide-glacier-200/[0.04] max-h-[480px] overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 px-6 py-3 hover:bg-titanium-800/30 transition-colors">
                      <Zap className="w-3.5 h-3.5 text-aurora-500 shrink-0" />
                      <span className="text-[11px] font-mono text-glacier-500 shrink-0 w-36">
                        [{formatLogTime(log.created_at)}]
                      </span>
                      <span className="text-[11px] font-bold text-aurora-400 shrink-0 w-24 truncate">
                        [{log.display_name}]
                      </span>
                      <span className="text-[11px] text-glacier-300 flex-1 truncate">
                        執行 [{log.action}]
                      </span>
                      <span className="text-[11px] font-medium text-blue-400 shrink-0 tabular-nums">
                        − {log.tokens_used.toLocaleString()} Tokens
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══ TAB: 資料匯出 ═══ */}
        {activeTab === 'export' && (
          <>
            <div className="bg-titanium-900/60 border border-aurora-500/20 rounded-2xl px-6 py-4 flex items-start gap-3">
              <DatabaseBackup className="w-5 h-5 text-aurora-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-glacier-200">資料備份說明</p>
                <p className="text-xs text-glacier-500 mt-1 leading-relaxed">
                  以下每個資料表都可以下載成 CSV 檔案，直接用 Excel 開啟。<br />
                  檔案以 UTF-8 編碼儲存，支援繁體中文，不會出現亂碼。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                {
                  table: 'properties', label: '物件清單', desc: '物件完整資料，含售價、地址、委託日期、主賣點等',
                  icon: Building2, color: 'text-aurora-400', bg: 'bg-aurora-500/10 border-aurora-500/20',
                  fields: ['物件編號', '地段', '地址備注', '售價萬', '建坪', '格局', '委託類型', '現況', '...'],
                  hasClientFilter: true,
                },
                {
                  table: 'buyers', label: '買方 CRM', desc: '買方聯絡人資料，含預算、偏好地區、狀態、備注',
                  icon: UserRound, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20',
                  fields: ['買方編號', '姓名', '電話', 'LINE', '來源', '狀態', '預算', '偏好地區', '...'],
                  hasClientFilter: true,
                },
                {
                  table: 'showings', label: '帶看記錄', desc: '所有帶看紀錄，含買方姓名、物件、反應、回訪情況',
                  icon: CalendarCheck, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20',
                  fields: ['帶看日期', '買方姓名', '物件地段', '反應', '回訪日期', '已完成', '...'],
                  hasClientFilter: true,
                },
                {
                  table: 'ai_logs', label: 'AI 使用日誌', desc: '所有客戶的 AI 文案生成紀錄，含時間、操作類型、Token 消耗',
                  icon: Bot, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20',
                  fields: ['客戶代碼', '客戶名稱', '操作', '物件編號', '消耗Tokens', '時間', '...'],
                  hasClientFilter: false,
                },
              ]).map(({ table, label, desc, icon: Icon, color, bg, fields, hasClientFilter }) => (
                <div key={table} className={`rounded-2xl border p-5 ${bg} bg-titanium-900`}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <p className="text-sm font-black text-glacier-200">{label}</p>
                  </div>
                  <p className="text-xs text-glacier-500 mb-3 leading-relaxed">{desc}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {fields.map((f) => (
                      <span key={f} className="text-[10px] bg-white/[0.06] text-glacier-400 px-1.5 py-0.5 rounded font-mono">{f}</span>
                    ))}
                  </div>

                  {/* Client filter dropdown */}
                  {hasClientFilter && clients.length > 0 && (
                    <div className="mb-3">
                      <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.1em] mb-1.5">
                        下載範圍
                      </label>
                      <select
                        value={exportClientMap[table] ?? 'ALL'}
                        onChange={(e) => setExportClientMap((prev) => ({ ...prev, [table]: e.target.value }))}
                        className="w-full bg-titanium-800 border border-glacier-200/[0.12] rounded-lg px-3 py-2 text-xs text-glacier-200 focus:outline-none focus:border-aurora-500/40 transition-colors"
                      >
                        <option value="ALL">✦ 全部客戶</option>
                        {clients.map((c) => (
                          <option key={c.client_id} value={c.client_id}>
                            {c.display_name}（{c.client_id}）
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={() => handleExport(table)}
                    disabled={exportingTable === table}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      exportingTable === table
                        ? 'bg-white/[0.06] text-glacier-600 cursor-not-allowed'
                        : 'bg-aurora-500 text-titanium-950 hover:bg-aurora-400 glow-aurora-sm'
                    }`}
                  >
                    {exportingTable === table ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> 準備下載中...</>
                    ) : (
                      <><Download className="w-4 h-4" /> 下載 {label} CSV</>
                    )}
                  </button>
                </div>
              ))}
            </div>

          </>
        )}
      </div>
    </div>
  );
}
