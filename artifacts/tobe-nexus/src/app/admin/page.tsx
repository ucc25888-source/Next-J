"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, BarChart3, Sparkles, ShieldOff, ShieldCheck,
  Plus, LogOut, RefreshCw, Network, PencilLine, X, Check, RotateCcw,
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
}

interface NewClientForm {
  client_id: string;
  display_name: string;
  login_token: string;
  plan_name: string;
  monthly_quota: number;
}

const PLAN_LABELS: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export default function AdminPage() {
  const router = useRouter();
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuota, setEditQuota] = useState<number>(30);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState<NewClientForm>({
    client_id: '', display_name: '', login_token: '', plan_name: 'basic', monthly_quota: 30,
  });
  const [addLoading, setAddLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clients');
      if (res.status === 403) { router.push('/'); return; }
      const data = await res.json();
      setClients(data.clients ?? []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleToggleStatus = async (client: AdminClient) => {
    const newStatus = client.status === 'active' ? 'suspended' : 'active';
    await fetch(`/api/admin/clients/${client.client_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setClients(clients.map(c =>
      c.client_id === client.client_id ? { ...c, status: newStatus } : c
    ));
  };

  const handleSaveQuota = async (clientId: string) => {
    await fetch(`/api/admin/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_quota: editQuota }),
    });
    setClients(clients.map(c =>
      c.client_id === clientId ? { ...c, monthly_quota: editQuota } : c
    ));
    setEditingId(null);
  };

  const handleResetUsage = async (clientId: string) => {
    await fetch(`/api/admin/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_usage: true }),
    });
    setClients(clients.map(c =>
      c.client_id === clientId ? { ...c, used_this_month: 0 } : c
    ));
  };

  const handleAddClient = async () => {
    if (!newClient.client_id || !newClient.display_name || !newClient.login_token) return;
    setAddLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${newClient.client_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewClient({ client_id: '', display_name: '', login_token: '', plan_name: 'basic', monthly_quota: 30 });
        await fetchClients();
      }
    } finally {
      setAddLoading(false);
    }
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
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]"
        >
          <LogOut className="w-3.5 h-3.5" /> 登出
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
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
              <button
                onClick={fetchClients}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-glacier-400 hover:text-glacier-200 border border-glacier-200/[0.08] rounded-lg transition-all"
              >
                <RefreshCw className="w-3 h-3" /> 重新整理
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm"
              >
                <Plus className="w-3.5 h-3.5" /> 新增客戶
              </button>
            </div>
          </div>

          {/* Add Client Form */}
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
                    <input
                      type="text"
                      placeholder={placeholder}
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
                  <select
                    value={newClient.plan_name}
                    onChange={(e) => setNewClient({ ...newClient, plan_name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-glacier-200 focus:outline-none"
                  >
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.1em] mb-1">月配額（次）</label>
                  <input
                    type="number"
                    min={1}
                    value={newClient.monthly_quota}
                    onChange={(e) => setNewClient({ ...newClient, monthly_quota: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-glacier-200 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddClient}
                  disabled={addLoading || !newClient.client_id || !newClient.display_name || !newClient.login_token}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 disabled:opacity-50 transition-all"
                >
                  <Check className="w-3.5 h-3.5" /> {addLoading ? '新增中...' : '確認新增'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-glacier-500 border border-glacier-200/[0.1] rounded-lg hover:text-glacier-300 transition-all"
                >
                  <X className="w-3.5 h-3.5" /> 取消
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="px-6 py-12 text-center text-glacier-500 text-sm">載入中...</div>
          ) : clients.length === 0 ? (
            <div className="px-6 py-12 text-center text-glacier-500 text-sm">尚無客戶</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-glacier-200/[0.05]">
                    {['客戶代碼', '名稱', '方案', '本月用量', '案件數', '狀態', '操作'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-glacier-500 uppercase tracking-[0.1em]">
                        {h}
                      </th>
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
                              <input
                                type="number"
                                min={1}
                                value={editQuota}
                                onChange={(e) => setEditQuota(Number(e.target.value))}
                                className="w-20 bg-white border border-aurora-500/40 rounded px-2 py-1 text-xs text-glacier-200 focus:outline-none"
                              />
                              <button onClick={() => handleSaveQuota(c.client_id)} className="text-aurora-500 hover:text-aurora-400">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="text-glacier-500 hover:text-glacier-300">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium tabular-nums ${isOver ? 'text-red-400' : 'text-aurora-400'}`}>
                                  {c.used_this_month} / {c.monthly_quota}
                                </span>
                                <button
                                  onClick={() => { setEditingId(c.client_id); setEditQuota(c.monthly_quota); }}
                                  className="text-glacier-600 hover:text-aurora-400 transition-colors"
                                  title="修改配額上限"
                                >
                                  <PencilLine className="w-3 h-3" />
                                </button>
                                {isOver && (
                                  <button
                                    onClick={() => handleResetUsage(c.client_id)}
                                    className="text-amber-500 hover:text-amber-400 transition-colors"
                                    title="重置本月用量"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="w-24 h-1 bg-titanium-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isOver ? 'bg-red-500' : usagePct >= 80 ? 'bg-amber-400' : 'bg-aurora-500'}`}
                                  style={{ width: `${usagePct}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-glacier-400 text-xs tabular-nums">{c.property_count} 件</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {c.status === 'active' ? '正常' : '已停用'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                              c.status === 'active'
                                ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                                : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                            }`}
                          >
                            {c.status === 'active'
                              ? <><ShieldOff className="w-3 h-3" /> 停用 AI</>
                              : <><ShieldCheck className="w-3 h-3" /> 恢復</>
                            }
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
      </div>
    </div>
  );
}
