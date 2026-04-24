"use client";

import { useState, useEffect, useCallback } from "react";
import { usePropertyStore } from "@/store/usePropertyStore";
import PageHeader from "@/components/PageHeader";
import {
  Plus, CalendarCheck, Phone, Trash2,
  X, Save, ChevronDown, MessageSquare,
  Building2, TrendingUp, Frown, Meh, Smile, Star,
  Edit2, Hash, Clock,
} from "lucide-react";
import type { Showing } from "@/types";

const SOURCES = ['平台', '介紹', '自來', '其他'];
const REACTIONS = ['很有興趣', '有點興趣', '普通', '否定'];

/* ── Light-theme vivid reaction styles ── */
const REACTION_CARD_STYLE: Record<string, {
  badge: string; leftBorder: string; dateBg: string; dateText: string; icon: React.ElementType;
}> = {
  '很有興趣': {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    leftBorder: 'border-l-4 border-l-emerald-400',
    dateBg: 'bg-emerald-50 border-emerald-200',
    dateText: 'text-emerald-700',
    icon: Star,
  },
  '有點興趣': {
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    leftBorder: 'border-l-4 border-l-amber-400',
    dateBg: 'bg-amber-50 border-amber-200',
    dateText: 'text-amber-700',
    icon: Smile,
  },
  '普通': {
    badge: 'bg-slate-100 text-slate-600 border-slate-300',
    leftBorder: 'border-l-4 border-l-slate-300',
    dateBg: 'bg-slate-50 border-slate-200',
    dateText: 'text-slate-600',
    icon: Meh,
  },
  '否定': {
    badge: 'bg-red-100 text-red-700 border-red-300',
    leftBorder: 'border-l-4 border-l-red-400',
    dateBg: 'bg-red-50 border-red-200',
    dateText: 'text-red-700',
    icon: Frown,
  },
};

const REACTION_QUICK_STYLE: Record<string, string> = {
  '很有興趣': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  '有點興趣': 'bg-amber-100 text-amber-700 border-amber-300',
  '普通':    'bg-slate-100 text-slate-600 border-slate-300',
  '否定':    'bg-red-100 text-red-600 border-red-300',
};

const REACTION_DOT: Record<string, string> = {
  '很有興趣': 'bg-emerald-500',
  '有點興趣': 'bg-amber-500',
  '普通': 'bg-slate-400',
  '否定': 'bg-red-500',
};

const SOURCE_STYLE: Record<string, string> = {
  '平台': 'bg-blue-50 text-blue-600 border-blue-200',
  '介紹': 'bg-violet-50 text-violet-600 border-violet-200',
  '自來': 'bg-teal-50 text-teal-700 border-teal-200',
  '其他': 'bg-slate-50 text-slate-500 border-slate-200',
};

const today = new Date().toISOString().slice(0, 10);

const blankForm = {
  property_id: '',
  showing_date: today,
  buyer_name: '',
  buyer_phone: '',
  buyer_source: '平台',
  reaction: '有點興趣',
  offer_wan: '',
  follow_up: '',
  follow_up_date: '',
  notes: '',
};

export default function ShowingsPage() {
  const properties = usePropertyStore((s) => s.properties);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setOpenId(p.get('open'));
  }, []);

  const [showings, setShowings] = useState<Showing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...blankForm });
  const [saving, setSaving] = useState(false);
  const [filterPropId, setFilterPropId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/showings?_t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setShowings(data.showings ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-scroll and highlight when navigated from daily-focus
  useEffect(() => {
    if (!openId || loading) return;
    setTimeout(() => {
      const el = document.getElementById(`showing-${openId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, [openId, loading]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    const onFocus   = () => load();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const openModal = () => { setEditingId(null); setForm({ ...blankForm }); setShowModal(true); };

  const openEditModal = (s: Showing) => {
    setEditingId(s.id);
    setForm({
      property_id: s.property_id ?? '',
      showing_date: s.showing_date,
      buyer_name: s.buyer_name,
      buyer_phone: s.buyer_phone,
      buyer_source: s.buyer_source,
      reaction: s.reaction,
      offer_wan: s.offer_wan > 0 ? String(s.offer_wan) : '',
      follow_up: s.follow_up ?? '',
      follow_up_date: s.follow_up_date ?? '',
      notes: s.notes ?? '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.buyer_name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, offer_wan: Number(form.offer_wan) || 0, property_id: form.property_id || null, follow_up_date: form.follow_up_date || null };
      if (editingId) {
        const res = await fetch(`/api/showings/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setShowings((prev) => prev.map((s) => s.id === editingId ? { ...s, ...data.showing } : s));
          setShowModal(false);
        }
      } else {
        const res = await fetch('/api/showings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setShowings((prev) => [data.showing, ...prev]);
          setShowModal(false);
        }
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('確定要刪除這筆帶看紀錄嗎？')) return;
    await fetch(`/api/showings/${id}`, { method: 'DELETE' });
    setShowings((prev) => prev.filter((s) => s.id !== id));
  };

  const getPropertyTitle = (propId: string | null) => {
    if (!propId) return null;
    const p = properties.find((pr) => pr.id === propId);
    if (!p) return null;
    return `${p.listing_id ? `[${p.listing_id}] ` : ''}${p.subarea} ${p.property_type}`;
  };

  const filtered = filterPropId ? showings.filter((s) => s.property_id === filterPropId) : showings;

  /* Reaction summary counts */
  const reactionCounts = REACTIONS.reduce<Record<string, number>>((acc, r) => {
    acc[r] = showings.filter((s) => s.reaction === r).length;
    return acc;
  }, {});

  const inputCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-aurora-500/60 focus:ring-1 focus:ring-aurora-500/20 transition-colors';
  const labelCls = 'block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-1.5';

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="帶看紀錄"
        badge="Showings"
        subtitle={`記錄每次帶看情況與買方反應 · 共 ${showings.length} 筆`}
        actions={
          <button onClick={openModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm">
            <Plus className="w-3.5 h-3.5" /> 新增帶看
          </button>
        }
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 lg:space-y-5">

        {/* Reaction summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {REACTIONS.map((r) => {
            const cfg = REACTION_CARD_STYLE[r];
            const Icon = cfg.icon;
            return (
              <div key={r} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${cfg.badge}`}>
                <Icon className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-xl font-black leading-none">{reactionCounts[r] ?? 0}</p>
                  <p className="text-[10px] font-bold mt-0.5">{r}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 bg-white border-2 border-slate-200 rounded-lg text-xs text-glacier-400 focus:outline-none focus:border-aurora-500/60 transition-colors cursor-pointer font-medium"
              value={filterPropId}
              onChange={(e) => setFilterPropId(e.target.value)}
            >
              <option value="">📋 全部物件</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.listing_id ? `[${p.listing_id}] ` : ''}{p.subarea} {p.property_type}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-glacier-500 pointer-events-none" />
          </div>
          {filterPropId && (
            <button onClick={() => setFilterPropId('')}
              className="text-xs text-aurora-600 font-semibold hover:text-aurora-700 transition-colors">
              ✕ 清除篩選
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 space-y-3 border-2 border-slate-100 animate-pulse">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-4 w-36 bg-slate-100 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-xl">
            <CalendarCheck className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-glacier-400">
              {filterPropId ? '此物件暫無帶看紀錄' : '尚無帶看紀錄'}
            </p>
            <p className="text-xs text-glacier-500 mt-1">點擊「新增帶看」開始記錄</p>
            <button onClick={openModal}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all">
              <Plus className="w-4 h-4" /> 新增帶看
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => {
              const propTitle = getPropertyTitle(s.property_id);
              const cfg = REACTION_CARD_STYLE[s.reaction] ?? REACTION_CARD_STYLE['普通'];
              const ReactionIcon = cfg.icon;
              const isHighlighted = openId === String(s.id);
              return (
                <div key={s.id} id={`showing-${s.id}`}
                  className={`bg-white border border-slate-200 ${cfg.leftBorder} rounded-xl overflow-hidden hover:shadow-md transition-all group ${isHighlighted ? 'ring-4 ring-aurora-400 ring-offset-2' : ''}`}>

                  {/* Date header — colored per reaction */}
                  <div className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-100 ${cfg.dateBg}`}>
                    <div className="flex items-center gap-2">
                      <CalendarCheck className={`w-3.5 h-3.5 shrink-0 ${cfg.dateText}`} />
                      <span className={`text-xs font-bold ${cfg.dateText}`}>
                        {new Date(s.showing_date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(s)}
                        className="opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-aurora-500 hover:bg-aurora-50 active:text-aurora-500 active:bg-aurora-50 transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(s.id)}
                        className="opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 active:text-red-500 active:bg-red-50 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Clickable body */}
                  <div className="p-4 space-y-3 cursor-pointer" onClick={() => openEditModal(s)}>
                    {/* Property tag */}
                    {propTitle && (
                      <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                        <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                        <p className="text-[11px] text-blue-700 font-semibold truncate">{propTitle}</p>
                      </div>
                    )}

                    {/* Buyer info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-6 h-6 rounded-full bg-aurora-100 border-2 border-aurora-300 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-aurora-600">{s.buyer_name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-bold text-glacier-200">{s.buyer_name}</span>
                        {s.buyer_no && (
                          <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 font-bold">
                            <Hash className="w-2.5 h-2.5" />{s.buyer_no}
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${SOURCE_STYLE[s.buyer_source] ?? SOURCE_STYLE['其他']}`}>
                          {s.buyer_source}
                        </span>
                      </div>
                      {s.buyer_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-teal-500 shrink-0" />
                          <a href={`tel:${s.buyer_phone}`} onClick={(e) => e.stopPropagation()} className="text-xs text-glacier-400 hover:text-teal-600 transition-colors">
                            {s.buyer_phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Reaction + Offer */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                        <ReactionIcon className="w-3 h-3" />
                        {s.reaction}
                      </span>
                      {s.offer_wan > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-aurora-500 px-2.5 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          出價 {s.offer_wan.toLocaleString()} 萬
                        </span>
                      )}
                    </div>

                    {/* 追蹤事項 */}
                    <div className={`flex items-start gap-2 rounded-lg px-3 py-2 border ${s.follow_up ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                      <MessageSquare className={`w-3 h-3 shrink-0 mt-0.5 ${s.follow_up ? 'text-blue-500' : 'text-slate-300'}`} />
                      <div className="min-w-0">
                        <p className={`text-[10px] font-bold mb-0.5 ${s.follow_up ? 'text-blue-600' : 'text-slate-400'}`}>追蹤事項</p>
                        <p className={`text-[11px] leading-relaxed ${s.follow_up ? 'text-blue-900' : 'text-slate-400 italic'}`}>
                          {s.follow_up ? s.follow_up.split('\n')[0] : '（點擊卡片填寫）'}
                        </p>
                      </div>
                    </div>

                    {/* 下次約 */}
                    {s.follow_up_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-aurora-500 shrink-0" />
                        <span className="text-[11px] text-aurora-600 font-semibold">
                          下次約：{new Date(s.follow_up_date).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    )}

                    {/* 備註 */}
                    <p className={`text-[11px] pl-1 ${s.notes ? 'text-slate-500' : 'text-slate-300 italic'}`}>
                      備註：{s.notes || '（點擊卡片填寫）'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-aurora-500">
                  <CalendarCheck className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-bold text-glacier-200">{editingId ? '編輯帶看紀錄' : '新增帶看紀錄'}</h2>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>帶看日期 *</label>
                  <input type="date" className={inputCls} value={form.showing_date}
                    onChange={(e) => setForm((f) => ({ ...f, showing_date: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>帶看物件</label>
                  <select className={inputCls + ' cursor-pointer'} value={form.property_id}
                    onChange={(e) => setForm((f) => ({ ...f, property_id: e.target.value }))}>
                    <option value="">未指定</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.listing_id ? `[${p.listing_id}] ` : ''}{p.subarea} {p.property_type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>買方姓名 *</label>
                  <input type="text" className={inputCls} value={form.buyer_name}
                    onChange={(e) => setForm((f) => ({ ...f, buyer_name: e.target.value }))} placeholder="例：王先生" />
                </div>
                <div>
                  <label className={labelCls}>買方電話</label>
                  <input type="tel" className={inputCls} value={form.buyer_phone}
                    onChange={(e) => setForm((f) => ({ ...f, buyer_phone: e.target.value }))} placeholder="09xx-xxxxxx" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>買方來源</label>
                  <select className={inputCls + ' cursor-pointer'} value={form.buyer_source}
                    onChange={(e) => setForm((f) => ({ ...f, buyer_source: e.target.value }))}>
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>買方反應</label>
                  <select className={inputCls + ' cursor-pointer'} value={form.reaction}
                    onChange={(e) => setForm((f) => ({ ...f, reaction: e.target.value }))}>
                    {REACTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Reaction quick-select */}
              <div className="flex gap-2 flex-wrap">
                {REACTIONS.map((r) => {
                  const Icon = REACTION_CARD_STYLE[r].icon;
                  return (
                    <button key={r} type="button"
                      onClick={() => setForm((f) => ({ ...f, reaction: r }))}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${
                        form.reaction === r ? REACTION_QUICK_STYLE[r] + ' scale-105 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                      <Icon className="w-3.5 h-3.5" />
                      {r}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className={labelCls}>出價意向（萬，0 = 無出價）</label>
                <input type="number" className={inputCls} value={form.offer_wan}
                  onChange={(e) => setForm((f) => ({ ...f, offer_wan: e.target.value }))}
                  placeholder="例：850" min="0" />
              </div>

              <div>
                <label className={labelCls}>🔔 下次回訪日（自動加入每日重點）</label>
                <input type="date" className={inputCls} value={form.follow_up_date}
                  onChange={(e) => setForm((f) => ({ ...f, follow_up_date: e.target.value }))} />
              </div>

              <div>
                <label className={labelCls}>追蹤事項</label>
                <textarea className={inputCls + ' resize-none'} rows={2} value={form.follow_up}
                  onChange={(e) => setForm((f) => ({ ...f, follow_up: e.target.value }))}
                  placeholder="例：3天後再電聯確認意願..." />
              </div>

              <div>
                <label className={labelCls}>備註</label>
                <textarea className={inputCls + ' resize-none'} rows={2} value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="例：買方偏好採光佳的3房格局..." />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-glacier-400 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all">
                取消
              </button>
              <button onClick={handleSave} disabled={saving || !form.buyer_name.trim()}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-aurora-500 rounded-lg hover:bg-aurora-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-aurora-sm">
                <Save className="w-3.5 h-3.5" />
                {saving ? '儲存中...' : editingId ? '更新紀錄' : '儲存紀錄'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
