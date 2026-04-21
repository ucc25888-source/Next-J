"use client";

import { useState, useEffect, useCallback } from "react";
import { usePropertyStore } from "@/store/usePropertyStore";
import PageHeader from "@/components/PageHeader";
import {
  Plus, CalendarCheck, Phone, User, Trash2,
  X, Save, ChevronDown, MessageSquare, Target
} from "lucide-react";
import type { Showing } from "@/types";

const SOURCES = ['平台', '介紹', '自來', '其他'];
const REACTIONS = ['很有興趣', '有點興趣', '普通', '否定'];

const REACTION_STYLE: Record<string, string> = {
  '很有興趣': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  '有點興趣': 'bg-aurora-500/10 text-aurora-400 border-aurora-500/25',
  '普通': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  '否定': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const REACTION_DOT: Record<string, string> = {
  '很有興趣': 'bg-emerald-500',
  '有點興趣': 'bg-aurora-500',
  '普通': 'bg-slate-500',
  '否定': 'bg-red-500',
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
  notes: '',
};

export default function ShowingsPage() {
  const properties = usePropertyStore((s) => s.properties);
  const [showings, setShowings] = useState<Showing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...blankForm });
  const [saving, setSaving] = useState(false);
  const [filterPropId, setFilterPropId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/showings');
      if (res.ok) {
        const data = await res.json();
        setShowings(data.showings ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = () => {
    setForm({ ...blankForm });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.buyer_name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/showings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          offer_wan: Number(form.offer_wan) || 0,
          property_id: form.property_id || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowings((prev) => [data.showing, ...prev]);
        setShowModal(false);
      }
    } finally {
      setSaving(false);
    }
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

  const filtered = filterPropId
    ? showings.filter((s) => s.property_id === filterPropId)
    : showings;

  const inputCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-aurora-500/60 focus:ring-1 focus:ring-aurora-500/20 transition-colors';
  const labelCls = 'block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-1.5';

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="帶看紀錄"
        badge="Showings"
        subtitle={`記錄每次帶看情況與買方反應 · 共 ${showings.length} 筆`}
        actions={
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            新增帶看
          </button>
        }
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 lg:space-y-6">

        {/* Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 bg-titanium-900 border border-glacier-200/[0.08] rounded-lg text-xs text-glacier-300 focus:outline-none focus:border-aurora-500/40 transition-colors cursor-pointer"
              value={filterPropId}
              onChange={(e) => setFilterPropId(e.target.value)}
            >
              <option value="">全部物件</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.listing_id ? `[${p.listing_id}] ` : ''}{p.subarea} {p.property_type}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-glacier-500 pointer-events-none" />
          </div>
          {filterPropId && (
            <button
              onClick={() => setFilterPropId('')}
              className="text-xs text-glacier-500 hover:text-glacier-200 transition-colors"
            >
              清除篩選
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-titanium-900 rounded-xl p-4 space-y-3 border border-glacier-200/[0.07] animate-pulse">
                <div className="h-3 w-24 bg-titanium-700/50 rounded" />
                <div className="h-4 w-36 bg-titanium-700/50 rounded" />
                <div className="h-3 w-20 bg-titanium-700/50 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-titanium-900 border-2 border-dashed border-glacier-200/[0.08] rounded-xl">
            <CalendarCheck className="w-12 h-12 text-glacier-600 mb-3" />
            <p className="text-sm font-medium text-glacier-400">
              {filterPropId ? '此物件暫無帶看紀錄' : '尚無帶看紀錄'}
            </p>
            <p className="text-xs text-glacier-600 mt-1">點擊「新增帶看」開始記錄</p>
            <button
              onClick={openModal}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all"
            >
              <Plus className="w-4 h-4" /> 新增帶看
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => {
              const propTitle = getPropertyTitle(s.property_id);
              return (
                <div key={s.id} className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden hover:border-aurora-500/20 transition-all group">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-glacier-200/[0.06]">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-3.5 h-3.5 text-aurora-500 shrink-0" />
                      <span className="text-xs font-bold text-glacier-300">
                        {new Date(s.showing_date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-glacier-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Property */}
                    {propTitle && (
                      <p className="text-[11px] text-aurora-400 bg-aurora-500/[0.08] border border-aurora-500/15 rounded-md px-2 py-1 truncate">
                        {propTitle}
                      </p>
                    )}

                    {/* Buyer info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-glacier-500 shrink-0" />
                        <span className="text-sm font-semibold text-glacier-200">{s.buyer_name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-titanium-700 text-glacier-500 border border-glacier-200/[0.06]">
                          {s.buyer_source}
                        </span>
                      </div>
                      {s.buyer_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-glacier-500 shrink-0" />
                          <a href={`tel:${s.buyer_phone}`} className="text-xs text-glacier-400 hover:text-aurora-400 transition-colors">
                            {s.buyer_phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Reaction + Offer */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full border ${REACTION_STYLE[s.reaction] ?? REACTION_STYLE['普通']}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${REACTION_DOT[s.reaction] ?? 'bg-slate-500'}`} />
                        {s.reaction}
                      </span>
                      {s.offer_wan > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-aurora-400">
                          <Target className="w-3 h-3" />
                          出價 {s.offer_wan.toLocaleString()} 萬
                        </span>
                      )}
                    </div>

                    {/* Follow-up */}
                    {s.follow_up && (
                      <div className="flex items-start gap-2 bg-amber-500/[0.05] border border-amber-500/15 rounded-lg px-3 py-2">
                        <MessageSquare className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-300 leading-relaxed">{s.follow_up}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {s.notes && (
                      <p className="text-[11px] text-glacier-500 leading-relaxed line-clamp-2">{s.notes}</p>
                    )}
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
          <div className="w-full sm:max-w-lg bg-titanium-900 rounded-t-2xl sm:rounded-2xl border border-glacier-200/[0.07] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-glacier-200/[0.07] shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-aurora-500/10">
                  <CalendarCheck className="w-4 h-4 text-aurora-500" />
                </div>
                <h2 className="text-sm font-bold text-glacier-200">新增帶看紀錄</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-glacier-500 hover:text-glacier-200 hover:bg-titanium-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Date + Property */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>帶看日期 *</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.showing_date}
                    onChange={(e) => setForm((f) => ({ ...f, showing_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>帶看物件</label>
                  <select
                    className={inputCls + ' cursor-pointer'}
                    value={form.property_id}
                    onChange={(e) => setForm((f) => ({ ...f, property_id: e.target.value }))}
                  >
                    <option value="">未指定</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.listing_id ? `[${p.listing_id}] ` : ''}{p.subarea} {p.property_type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buyer info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>買方姓名 *</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={form.buyer_name}
                    onChange={(e) => setForm((f) => ({ ...f, buyer_name: e.target.value }))}
                    placeholder="例：王先生"
                  />
                </div>
                <div>
                  <label className={labelCls}>買方電話</label>
                  <input
                    type="tel"
                    className={inputCls}
                    value={form.buyer_phone}
                    onChange={(e) => setForm((f) => ({ ...f, buyer_phone: e.target.value }))}
                    placeholder="09xx-xxxxxx"
                  />
                </div>
              </div>

              {/* Source + Reaction */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>買方來源</label>
                  <select
                    className={inputCls + ' cursor-pointer'}
                    value={form.buyer_source}
                    onChange={(e) => setForm((f) => ({ ...f, buyer_source: e.target.value }))}
                  >
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>買方反應</label>
                  <select
                    className={inputCls + ' cursor-pointer'}
                    value={form.reaction}
                    onChange={(e) => setForm((f) => ({ ...f, reaction: e.target.value }))}
                  >
                    {REACTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Reaction quick-select */}
              <div className="flex gap-2 flex-wrap">
                {REACTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, reaction: r }))}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      form.reaction === r
                        ? REACTION_STYLE[r]
                        : 'bg-titanium-800 border-glacier-200/[0.08] text-glacier-500'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${form.reaction === r ? REACTION_DOT[r] : 'bg-glacier-600'}`} />
                    {r}
                  </button>
                ))}
              </div>

              {/* Offer */}
              <div>
                <label className={labelCls}>出價意向（萬，0 = 無出價）</label>
                <input
                  type="number"
                  className={inputCls}
                  value={form.offer_wan}
                  onChange={(e) => setForm((f) => ({ ...f, offer_wan: e.target.value }))}
                  placeholder="例：850"
                  min="0"
                />
              </div>

              {/* Follow-up */}
              <div>
                <label className={labelCls}>追蹤事項</label>
                <textarea
                  className={inputCls + ' resize-none'}
                  rows={2}
                  value={form.follow_up}
                  onChange={(e) => setForm((f) => ({ ...f, follow_up: e.target.value }))}
                  placeholder="例：3天後再電聯確認意願..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>備註</label>
                <textarea
                  className={inputCls + ' resize-none'}
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="例：買方偏好採光佳的3房格局..."
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-glacier-200/[0.07] shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-glacier-400 bg-titanium-800 border border-glacier-200/[0.08] rounded-lg hover:text-glacier-200 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.buyer_name.trim()}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-aurora-sm"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? '儲存中...' : '儲存紀錄'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
