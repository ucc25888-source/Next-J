"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Plus, Users, Phone, Mail, MessageCircle,
  X, Save, Pencil, Trash2, Search, ChevronDown,
  Target, Home, MapPin, BadgeCheck, Clock,
} from "lucide-react";
import type { Buyer } from "@/types";

const SOURCES = ["平台", "介紹", "自來", "其他"];

const STATUSES = ["潛在", "積極找房", "協商中", "已成交", "暫緩", "放棄"];

const STATUS_STYLE: Record<string, string> = {
  潛在: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  積極找房: "bg-aurora-500/10 text-aurora-400 border-aurora-500/25",
  協商中: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  已成交: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  暫緩: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  放棄: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_DOT: Record<string, string> = {
  潛在: "bg-slate-500",
  積極找房: "bg-aurora-500",
  協商中: "bg-amber-500",
  已成交: "bg-emerald-500",
  暫緩: "bg-orange-500",
  放棄: "bg-red-500",
};

const PROPERTY_TYPES = ["", "住宅", "土地 / 農地", "建地 / 工業地", "透天", "店面 / 辦公室"];
const ROOMS_OPTIONS = ["", "1房", "2房", "3房", "4房", "5房以上"];

const blankForm = {
  name: "",
  phone: "",
  email: "",
  line_id: "",
  source: "平台",
  budget_min: "",
  budget_max: "",
  pref_property_type: "",
  pref_area: "",
  pref_rooms: "",
  pref_min_ping: "",
  status: "潛在",
  notes: "",
  last_contact_at: "",
};

type FormState = typeof blankForm;

function toForm(b: Buyer): FormState {
  return {
    name: b.name,
    phone: b.phone,
    email: b.email,
    line_id: b.line_id,
    source: b.source,
    budget_min: b.budget_min > 0 ? String(b.budget_min) : "",
    budget_max: b.budget_max > 0 ? String(b.budget_max) : "",
    pref_property_type: b.pref_property_type,
    pref_area: b.pref_area,
    pref_rooms: b.pref_rooms,
    pref_min_ping: b.pref_min_ping > 0 ? String(b.pref_min_ping) : "",
    status: b.status,
    notes: b.notes,
    last_contact_at: b.last_contact_at ?? "",
  };
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editBuyer, setEditBuyer] = useState<Buyer | null>(null);
  const [form, setForm] = useState<FormState>({ ...blankForm });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/buyers");
      if (res.ok) {
        const data = await res.json();
        setBuyers(data.buyers ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditBuyer(null);
    setForm({ ...blankForm });
    setShowDrawer(true);
  };

  const openEdit = (b: Buyer) => {
    setEditBuyer(b);
    setForm(toForm(b));
    setShowDrawer(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      budget_min: Number(form.budget_min) || 0,
      budget_max: Number(form.budget_max) || 0,
      pref_min_ping: Number(form.pref_min_ping) || 0,
      last_contact_at: form.last_contact_at || null,
    };
    try {
      if (editBuyer) {
        const res = await fetch(`/api/buyers/${editBuyer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setBuyers((prev) => prev.map((b) => b.id === editBuyer.id ? data.buyer : b));
          setShowDrawer(false);
        }
      } else {
        const res = await fetch("/api/buyers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setBuyers((prev) => [data.buyer, ...prev]);
          setShowDrawer(false);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("確定要刪除此客戶嗎？")) return;
    await fetch(`/api/buyers/${id}`, { method: "DELETE" });
    setBuyers((prev) => prev.filter((b) => b.id !== id));
  };

  const handleStatusChange = async (buyer: Buyer, newStatus: string) => {
    const res = await fetch(`/api/buyers/${buyer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...buyer, budget_min: buyer.budget_min, budget_max: buyer.budget_max, pref_min_ping: buyer.pref_min_ping, status: newStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      setBuyers((prev) => prev.map((b) => b.id === buyer.id ? data.buyer : b));
    }
  };

  const filtered = buyers.filter((b) => {
    if (filterStatus && b.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.phone.includes(q) || b.pref_area.toLowerCase().includes(q);
    }
    return true;
  });

  const statusCounts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = buyers.filter((b) => b.status === s).length;
    return acc;
  }, {});

  const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-aurora-500/60 focus:ring-1 focus:ring-aurora-500/20 transition-colors";
  const labelCls = "block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-1.5";

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="買方 CRM"
        badge="Buyers"
        subtitle={`客戶追蹤管理 · 共 ${buyers.length} 位買方`}
        actions={
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            新增買方
          </button>
        }
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 lg:space-y-5">

        {/* Status stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                filterStatus === s
                  ? STATUS_STYLE[s] + " scale-105"
                  : "bg-titanium-900 border-glacier-200/[0.07] text-glacier-500 hover:border-glacier-200/20"
              }`}
            >
              <span className={`text-lg font-black ${filterStatus === s ? "" : "text-glacier-300"}`}>
                {statusCounts[s] ?? 0}
              </span>
              <span className="text-[10px] font-semibold">{s}</span>
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-glacier-500" />
            <input
              type="text"
              placeholder="搜尋姓名、電話、區域..."
              className="w-full pl-9 pr-3 py-2 bg-titanium-900 border border-glacier-200/[0.08] rounded-lg text-xs text-glacier-300 placeholder:text-glacier-600 focus:outline-none focus:border-aurora-500/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(filterStatus || search) && (
            <button
              onClick={() => { setFilterStatus(""); setSearch(""); }}
              className="text-xs text-glacier-500 hover:text-glacier-200 transition-colors"
            >
              清除篩選
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-titanium-900 rounded-xl p-4 space-y-3 border border-glacier-200/[0.07] animate-pulse h-40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-titanium-900 border-2 border-dashed border-glacier-200/[0.08] rounded-xl">
            <Users className="w-12 h-12 text-glacier-600 mb-3" />
            <p className="text-sm font-medium text-glacier-400">
              {filterStatus || search ? "找不到符合的買方" : "尚無買方資料"}
            </p>
            <p className="text-xs text-glacier-600 mt-1">點擊「新增買方」開始建立 CRM</p>
            <button
              onClick={openAdd}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all"
            >
              <Plus className="w-4 h-4" /> 新增買方
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <div key={b.id} className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden hover:border-aurora-500/20 transition-all group flex flex-col">
                {/* Card header */}
                <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-glacier-200/[0.06]">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-aurora-500/10 border border-aurora-500/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-aurora-400">{b.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-glacier-200 leading-tight">{b.name}</p>
                      <p className="text-[10px] text-glacier-500 mt-0.5">{b.source} · {new Date(b.created_at).toLocaleDateString("zh-TW")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(b)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-glacier-600 hover:text-aurora-400 hover:bg-aurora-500/[0.08] transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-glacier-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1">
                  {/* Contact */}
                  <div className="space-y-1.5">
                    {b.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-glacier-500 shrink-0" />
                        <a href={`tel:${b.phone}`} className="text-xs text-glacier-400 hover:text-aurora-400 transition-colors">{b.phone}</a>
                      </div>
                    )}
                    {b.line_id && (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-3 h-3 text-glacier-500 shrink-0" />
                        <span className="text-xs text-glacier-400">{b.line_id}</span>
                      </div>
                    )}
                    {b.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-glacier-500 shrink-0" />
                        <span className="text-xs text-glacier-400 truncate">{b.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Budget */}
                  {(b.budget_min > 0 || b.budget_max > 0) && (
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-glacier-500 shrink-0" />
                      <span className="text-xs font-semibold text-aurora-400">
                        {b.budget_min > 0 && b.budget_max > 0
                          ? `${b.budget_min.toLocaleString()} – ${b.budget_max.toLocaleString()} 萬`
                          : b.budget_max > 0
                          ? `上限 ${b.budget_max.toLocaleString()} 萬`
                          : `${b.budget_min.toLocaleString()} 萬起`}
                      </span>
                    </div>
                  )}

                  {/* Preferences */}
                  <div className="flex flex-wrap gap-1.5">
                    {b.pref_property_type && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-titanium-800 text-glacier-400 border border-glacier-200/[0.07]">
                        <Home className="w-2.5 h-2.5" />{b.pref_property_type}
                      </span>
                    )}
                    {b.pref_area && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-titanium-800 text-glacier-400 border border-glacier-200/[0.07]">
                        <MapPin className="w-2.5 h-2.5" />{b.pref_area}
                      </span>
                    )}
                    {b.pref_rooms && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-titanium-800 text-glacier-400 border border-glacier-200/[0.07]">
                        {b.pref_rooms}
                      </span>
                    )}
                    {b.pref_min_ping > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-titanium-800 text-glacier-400 border border-glacier-200/[0.07]">
                        {b.pref_min_ping}坪以上
                      </span>
                    )}
                  </div>

                  {/* Last contact */}
                  {b.last_contact_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-glacier-500 shrink-0" />
                      <span className="text-[11px] text-glacier-500">
                        最後聯繫：{new Date(b.last_contact_at).toLocaleDateString("zh-TW")}
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {b.notes && (
                    <p className="text-[11px] text-glacier-500 leading-relaxed line-clamp-2 border-t border-glacier-200/[0.06] pt-2">{b.notes}</p>
                  )}
                </div>

                {/* Status footer */}
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        className={`w-full appearance-none text-[11px] font-bold px-3 py-1.5 pr-7 rounded-lg border cursor-pointer focus:outline-none transition-all ${STATUS_STYLE[b.status] ?? STATUS_STYLE["潛在"]}`}
                        value={b.status}
                        onChange={(e) => handleStatusChange(b, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-titanium-900 text-glacier-200">{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                    </div>
                    {b.status === "已成交" && (
                      <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-titanium-900 rounded-t-2xl sm:rounded-2xl border border-glacier-200/[0.07] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-glacier-200/[0.07] shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-aurora-500/10">
                  <Users className="w-4 h-4 text-aurora-500" />
                </div>
                <h2 className="text-sm font-bold text-glacier-200">
                  {editBuyer ? "編輯買方資料" : "新增買方"}
                </h2>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1.5 rounded-lg text-glacier-500 hover:text-glacier-200 hover:bg-titanium-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Name + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>姓名 *</label>
                  <input type="text" className={inputCls} placeholder="例：王小明" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>電話</label>
                  <input type="tel" className={inputCls} placeholder="09xx-xxxxxx" value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>

              {/* Email + LINE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" className={inputCls} placeholder="xxx@gmail.com" value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>LINE ID</label>
                  <input type="text" className={inputCls} placeholder="@line_id" value={form.line_id}
                    onChange={(e) => setForm((f) => ({ ...f, line_id: e.target.value }))} />
                </div>
              </div>

              {/* Source + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>來源</label>
                  <select className={inputCls + " cursor-pointer"} value={form.source}
                    onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}>
                    {SOURCES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>狀態</label>
                  <select className={inputCls + " cursor-pointer"} value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Status quick-select */}
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button key={s} type="button"
                    onClick={() => setForm((f) => ({ ...f, status: s }))}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      form.status === s ? STATUS_STYLE[s] : "bg-titanium-800 border-glacier-200/[0.08] text-glacier-500"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${form.status === s ? STATUS_DOT[s] : "bg-glacier-600"}`} />
                    {s}
                  </button>
                ))}
              </div>

              {/* Budget */}
              <div>
                <label className={labelCls}>預算範圍（萬）</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" className={inputCls} placeholder="最低（例：500）" value={form.budget_min}
                    onChange={(e) => setForm((f) => ({ ...f, budget_min: e.target.value }))} min="0" />
                  <input type="number" className={inputCls} placeholder="最高（例：1200）" value={form.budget_max}
                    onChange={(e) => setForm((f) => ({ ...f, budget_max: e.target.value }))} min="0" />
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label className={labelCls}>物件偏好</label>
                <div className="grid grid-cols-2 gap-3">
                  <select className={inputCls + " cursor-pointer"} value={form.pref_property_type}
                    onChange={(e) => setForm((f) => ({ ...f, pref_property_type: e.target.value }))}>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t || "物件類型（不限）"}</option>)}
                  </select>
                  <select className={inputCls + " cursor-pointer"} value={form.pref_rooms}
                    onChange={(e) => setForm((f) => ({ ...f, pref_rooms: e.target.value }))}>
                    {ROOMS_OPTIONS.map((r) => <option key={r} value={r}>{r || "房型（不限）"}</option>)}
                  </select>
                </div>
              </div>

              {/* Area + Ping */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>偏好區域</label>
                  <input type="text" className={inputCls} placeholder="例：花蓮市、吉安鄉" value={form.pref_area}
                    onChange={(e) => setForm((f) => ({ ...f, pref_area: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>最小坪數（坪）</label>
                  <input type="number" className={inputCls} placeholder="例：30" value={form.pref_min_ping}
                    onChange={(e) => setForm((f) => ({ ...f, pref_min_ping: e.target.value }))} min="0" />
                </div>
              </div>

              {/* Last contact */}
              <div>
                <label className={labelCls}>最後聯繫日期</label>
                <input type="date" className={inputCls} value={form.last_contact_at}
                  onChange={(e) => setForm((f) => ({ ...f, last_contact_at: e.target.value }))} />
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>備註</label>
                <textarea className={inputCls + " resize-none"} rows={3} value={form.notes}
                  placeholder="客戶偏好、注意事項等..."
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            {/* Drawer footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-glacier-200/[0.07] shrink-0">
              <button onClick={() => setShowDrawer(false)}
                className="px-4 py-2 text-sm font-medium text-glacier-400 bg-titanium-800 border border-glacier-200/[0.08] rounded-lg hover:text-glacier-200 transition-all">
                取消
              </button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-aurora-sm">
                <Save className="w-3.5 h-3.5" />
                {saving ? "儲存中..." : editBuyer ? "更新資料" : "新增買方"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
