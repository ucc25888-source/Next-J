"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePropertyStore } from "@/store/usePropertyStore";
import PageHeader from "@/components/PageHeader";
import {
  Plus, Users, Phone, Mail, MessageCircle,
  X, Save, Pencil, Trash2, Search, ChevronDown,
  Target, Home, MapPin, BadgeCheck, Clock,
  CalendarCheck, Star, Smile, Meh, Frown, TrendingUp,
  ChevronUp, MessageSquare, Bell,
} from "lucide-react";
import type { Buyer, Showing } from "@/types";

const SOURCES = ["平台", "介紹", "自來", "其他"];
const STATUSES = ["潛在", "積極找", "協商中", "已成交", "暫緩", "放棄"];
const REACTIONS = ["很有興趣", "有點興趣", "普通", "否定"];

const STATUS_STYLE: Record<string, string> = {
  潛在: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  積極找: "bg-aurora-500/10 text-aurora-400 border-aurora-500/25",
  協商中: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  已成交: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  暫緩: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  放棄: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_DOT: Record<string, string> = {
  潛在: "bg-slate-500",
  積極找: "bg-aurora-500",
  協商中: "bg-amber-500",
  已成交: "bg-emerald-500",
  暫緩: "bg-orange-500",
  放棄: "bg-red-500",
};

const STATUS_STAT_IDLE: Record<string, string> = {
  潛在:  "border-slate-300  bg-slate-50   text-slate-600",
  積極找: "border-amber-300  bg-amber-50   text-amber-700",
  協商中: "border-yellow-400 bg-yellow-50  text-yellow-700",
  已成交: "border-emerald-400 bg-emerald-50 text-emerald-700",
  暫緩:  "border-orange-300 bg-orange-50  text-orange-700",
  放棄:  "border-red-300    bg-red-50     text-red-600",
};

const STATUS_LEFT_BORDER: Record<string, string> = {
  潛在:  "border-l-4 border-l-slate-300",
  積極找: "border-l-4 border-l-amber-400",
  協商中: "border-l-4 border-l-yellow-400",
  已成交: "border-l-4 border-l-emerald-400",
  暫緩:  "border-l-4 border-l-orange-400",
  放棄:  "border-l-4 border-l-red-400",
};

const STATUS_AVATAR: Record<string, { bg: string; text: string }> = {
  潛在:  { bg: "bg-slate-100 border-slate-300",    text: "text-slate-600" },
  積極找: { bg: "bg-amber-100 border-amber-300",    text: "text-amber-700" },
  協商中: { bg: "bg-yellow-100 border-yellow-300",  text: "text-yellow-700" },
  已成交: { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-700" },
  暫緩:  { bg: "bg-orange-100 border-orange-300",   text: "text-orange-700" },
  放棄:  { bg: "bg-red-100 border-red-300",         text: "text-red-600" },
};

const REACTION_MINI: Record<string, { badge: string; dot: string; icon: React.ElementType }> = {
  "很有興趣": { badge: "bg-emerald-100 text-emerald-700 border-emerald-300", dot: "bg-emerald-500", icon: Star },
  "有點興趣": { badge: "bg-amber-100 text-amber-700 border-amber-300",       dot: "bg-amber-500",  icon: Smile },
  "普通":     { badge: "bg-slate-100 text-slate-500 border-slate-200",       dot: "bg-slate-400",  icon: Meh },
  "否定":     { badge: "bg-red-100 text-red-600 border-red-200",             dot: "bg-red-500",    icon: Frown },
};

const REACTION_QUICK_STYLE: Record<string, string> = {
  "很有興趣": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "有點興趣": "bg-amber-100 text-amber-700 border-amber-300",
  "普通":     "bg-slate-100 text-slate-600 border-slate-300",
  "否定":     "bg-red-100 text-red-600 border-red-300",
};

const PROPERTY_TYPES = ["", "電梯/華廈", "透天/別墅", "店面/辦公室", "土地/農地(特殊用地)", "建地/工業地"];
const ROOMS_OPTIONS  = ["", "1房", "2房", "3房", "4房", "5房以上"];
const todayStr = new Date().toISOString().slice(0, 10);

const blankForm = {
  name: "", phone: "", email: "", line_id: "",
  source: "平台", budget_min: "", budget_max: "",
  pref_property_type: "", pref_area: "", pref_rooms: "", pref_min_ping: "",
  status: "潛在", notes: "", visit_log: "", last_contact_at: "", next_follow_up_date: "",
};
type FormState = typeof blankForm;

const blankShowingForm = {
  showing_date: todayStr, property_id: "",
  reaction: "有點興趣", offer_wan: "", follow_up: "", follow_up_date: "", notes: "",
};

function toForm(b: Buyer): FormState {
  return {
    name: b.name, phone: b.phone, email: b.email, line_id: b.line_id,
    source: b.source,
    budget_min: b.budget_min > 0 ? String(b.budget_min) : "",
    budget_max: b.budget_max > 0 ? String(b.budget_max) : "",
    pref_property_type: b.pref_property_type, pref_area: b.pref_area,
    pref_rooms: b.pref_rooms,
    pref_min_ping: b.pref_min_ping > 0 ? String(b.pref_min_ping) : "",
    status: b.status, notes: b.notes, visit_log: b.visit_log,
    last_contact_at: b.last_contact_at ?? "",
    next_follow_up_date: b.next_follow_up_date ?? "",
  };
}

export default function BuyersPage() {
  const properties = usePropertyStore((s) => s.properties);

  const [buyers, setBuyers]           = useState<Buyer[]>([]);
  const [allShowings, setAllShowings] = useState<Showing[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState(false);

  const [showDrawer, setShowDrawer]       = useState(false);
  const [editBuyer, setEditBuyer]         = useState<Buyer | null>(null);
  const [form, setForm]                   = useState<FormState>({ ...blankForm });
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState("");
  const [filterStatus, setFilterStatus]   = useState("");
  const [search, setSearch]               = useState("");

  const [showShowingModal, setShowShowingModal]       = useState(false);
  const [showingTarget, setShowingTarget]             = useState<Buyer | null>(null);
  const [editShowing, setEditShowing]                 = useState<Showing | null>(null);
  const [showingForm, setShowingForm]                 = useState({ ...blankShowingForm });
  const [savingShowing, setSavingShowing]             = useState(false);
  const [expandedBuyers, setExpandedBuyers] = useState<Set<string>>(new Set());
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showingStats, setShowingStats] = useState<{
    totals: { total: number; this_month: number; pending_followup: number; overdue_followup: number };
    reactions: { reaction: string; cnt: number }[];
    trend: { month: string; cnt: number }[];
    topProperties: { subarea: string; address_note: string; listing_id: string; shown_count: number; hot_count: number }[];
  } | null>(null);

  /* group showings by buyer_id */
  const showingsMap = useMemo(() => {
    const map: Record<string, Showing[]> = {};
    for (const s of allShowings) {
      if (s.buyer_id) {
        if (!map[s.buyer_id]) map[s.buyer_id] = [];
        map[s.buyer_id].push(s);
      }
    }
    return map;
  }, [allShowings]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const ts = Date.now();
      const [bRes, sRes, stRes] = await Promise.all([
        fetch(`/api/buyers?_t=${ts}`, { cache: "no-store" }),
        fetch(`/api/showings?_t=${ts}`, { cache: "no-store" }),
        fetch(`/api/showings/stats?_t=${ts}`, { cache: "no-store" }),
      ]);
      if (bRes.ok) {
        setBuyers((await bRes.json()).buyers ?? []);
      } else {
        setLoadError(true);
      }
      if (sRes.ok) setAllShowings((await sRes.json()).showings ?? []);
      if (stRes.ok) setShowingStats(await stRes.json());
    } catch {
      setLoadError(true);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const openAdd  = () => { setEditBuyer(null); setForm({ ...blankForm }); setShowDrawer(true); };
  const openEdit = (b: Buyer) => { setEditBuyer(b); setForm(toForm(b)); setShowDrawer(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError("");
    const payload = {
      ...form,
      budget_min:   Number(form.budget_min) || 0,
      budget_max:   Number(form.budget_max) || 0,
      pref_min_ping: Number(form.pref_min_ping) || 0,
      last_contact_at: form.last_contact_at || null,
    };
    try {
      if (editBuyer) {
        const res = await fetch(`/api/buyers/${editBuyer.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const d = await res.json();
          setBuyers((p) => p.map((b) => b.id === editBuyer.id ? d.buyer : b));
          setShowDrawer(false);
        } else {
          setSaveError("儲存失敗，請重試");
        }
      } else {
        const res = await fetch("/api/buyers", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const d = await res.json();
          setBuyers((p) => [d.buyer, ...p]);
          setFilterStatus("");
          setShowDrawer(false);
        } else {
          setSaveError("儲存失敗，請重試");
        }
      }
    } catch {
      setSaveError("網路錯誤，請重試");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("確定要刪除此客戶嗎？")) return;
    await fetch(`/api/buyers/${id}`, { method: "DELETE" });
    setBuyers((p) => p.filter((b) => b.id !== id));
  };

  const handleStatusChange = async (buyer: Buyer, newStatus: string) => {
    const res = await fetch(`/api/buyers/${buyer.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...buyer, status: newStatus }),
    });
    if (res.ok) {
      const d = await res.json();
      setBuyers((p) => p.map((b) => b.id === buyer.id ? d.buyer : b));
      if (filterStatus && filterStatus !== newStatus) setFilterStatus("");
    }
  };

  const openShowingModal = (buyer: Buyer) => {
    setShowingTarget(buyer);
    setEditShowing(null);
    setShowingForm({ ...blankShowingForm });
    setShowShowingModal(true);
  };

  const closeShowingModal = () => {
    setShowShowingModal(false);
    setEditShowing(null);
  };

  const handleSaveShowing = async () => {
    if (!showingTarget) return;
    setSavingShowing(true);
    try {
      if (editShowing) {
        /* ── EDIT mode ── */
        const res = await fetch(`/api/showings/${editShowing.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property_id:   showingForm.property_id || null,
            showing_date:  showingForm.showing_date,
            reaction:      showingForm.reaction,
            offer_wan:     Number(showingForm.offer_wan) || 0,
            follow_up:     showingForm.follow_up,
            follow_up_date: showingForm.follow_up_date || null,
            notes:         showingForm.notes,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          setAllShowings((p) => p.map((s) => s.id === editShowing.id ? d.showing : s));
          setShowShowingModal(false);
          setEditShowing(null);
        }
      } else {
        /* ── ADD mode ── */
        const res = await fetch("/api/showings", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyer_id:      showingTarget.id,
            buyer_name:    showingTarget.name,
            buyer_phone:   showingTarget.phone,
            buyer_source:  showingTarget.source,
            property_id:   showingForm.property_id || null,
            showing_date:  showingForm.showing_date,
            reaction:      showingForm.reaction,
            offer_wan:     Number(showingForm.offer_wan) || 0,
            follow_up:     showingForm.follow_up,
            follow_up_date: showingForm.follow_up_date || null,
            notes:         showingForm.notes,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          setAllShowings((p) => [d.showing, ...p]);
          setShowShowingModal(false);
        }
      }
    } finally { setSavingShowing(false); }
  };

  const openEditShowing = (buyer: Buyer, showing: Showing) => {
    setShowingTarget(buyer);
    setEditShowing(showing);
    setShowingForm({
      property_id:   showing.property_id ?? "",
      showing_date:  showing.showing_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      reaction:      showing.reaction ?? "有點興趣",
      offer_wan:     showing.offer_wan ? String(showing.offer_wan) : "",
      follow_up:     showing.follow_up ?? "",
      follow_up_date: showing.follow_up_date?.slice(0, 10) ?? "",
      notes:         showing.notes ?? "",
    });
    setShowShowingModal(true);
  };

  const handleDeleteShowing = async (showingId: string) => {
    if (!window.confirm("確定要刪除此帶看紀錄嗎？")) return;
    await fetch(`/api/showings/${showingId}`, { method: "DELETE" });
    setAllShowings((p) => p.filter((s) => s.id !== showingId));
  };

  const getPropertyTitle = (propId: string | null) => {
    if (!propId) return null;
    const p = properties.find((pr) => pr.id === propId);
    return p ? `${p.listing_id ? `[${p.listing_id}] ` : ""}${p.subarea} ${p.property_type}` : null;
  };

  const toggleExpand = (id: string) =>
    setExpandedBuyers((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = buyers.filter((b) => {
    if (filterStatus && b.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.phone.includes(q) || b.pref_area.toLowerCase().includes(q);
    }
    return true;
  });

  const statusCounts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = buyers.filter((b) => b.status === s).length; return acc;
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
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm">
            <Plus className="w-3.5 h-3.5" /> 新增買方
          </button>
        }
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-4 lg:space-y-5">

        {/* ── 帶看統計摘要 ── */}
        {showingStats && (
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-2xl overflow-hidden">
            {/* Header row — always visible */}
            <button
              onClick={() => setShowStatsPanel((p) => !p)}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-titanium-800/40 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-aurora-500 shrink-0" />
              <span className="text-sm font-black text-glacier-200">帶看統計摘要</span>

              {/* Inline key numbers */}
              <div className="flex items-center gap-3 ml-3 flex-1 overflow-x-auto">
                {[
                  { label: '本月帶看', value: showingStats.totals.this_month, color: 'text-aurora-400' },
                  { label: '累計帶看', value: showingStats.totals.total,      color: 'text-glacier-300' },
                  { label: '待回訪',   value: showingStats.totals.pending_followup, color: 'text-blue-400' },
                  { label: '逾期回訪', value: showingStats.totals.overdue_followup, color: 'text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-lg font-black tabular-nums ${color}`}>{value}</span>
                    <span className="text-[10px] text-glacier-500">{label}</span>
                  </div>
                ))}
              </div>

              <ChevronDown className={`w-4 h-4 text-glacier-500 shrink-0 transition-transform ${showStatsPanel ? 'rotate-180' : ''}`} />
            </button>

            {/* Expandable detail */}
            {showStatsPanel && (
              <div className="border-t border-glacier-200/[0.06] px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Reaction breakdown */}
                <div>
                  <p className="text-[10px] font-black text-glacier-500 uppercase tracking-[0.12em] mb-3">帶看反應分佈</p>
                  {showingStats.reactions.length === 0 ? (
                    <p className="text-xs text-glacier-600">尚無帶看紀錄</p>
                  ) : (() => {
                    const total = showingStats.reactions.reduce((a, r) => a + r.cnt, 0);
                    const REACTION_COLOR: Record<string, string> = {
                      '很有興趣': 'bg-emerald-500', '有點興趣': 'bg-amber-400',
                      '普通': 'bg-slate-400', '否定': 'bg-red-400',
                    };
                    return (
                      <div className="space-y-2.5">
                        {showingStats.reactions.map((r) => (
                          <div key={r.reaction} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-glacier-300">{r.reaction}</span>
                              <span className="text-xs text-glacier-500 tabular-nums">
                                {r.cnt} 次（{Math.round((r.cnt / total) * 100)}%）
                              </span>
                            </div>
                            <div className="h-2 bg-titanium-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${REACTION_COLOR[r.reaction] ?? 'bg-glacier-500'}`}
                                style={{ width: `${Math.round((r.cnt / total) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Top 5 properties */}
                <div>
                  <p className="text-[10px] font-black text-glacier-500 uppercase tracking-[0.12em] mb-3">帶看最多物件 Top 5</p>
                  {showingStats.topProperties.length === 0 ? (
                    <p className="text-xs text-glacier-600">尚無帶看紀錄</p>
                  ) : (
                    <div className="space-y-2">
                      {showingStats.topProperties.map((p, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            i === 0 ? 'bg-aurora-500 text-titanium-950' : 'bg-titanium-700 text-glacier-400'
                          }`}>{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-glacier-200 truncate">
                              {p.listing_id ? `[${p.listing_id}] ` : ''}{p.subarea}
                            </p>
                            <p className="text-[10px] text-glacier-600 truncate">{p.address_note}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-aurora-400">{p.shown_count} 次</p>
                            {p.hot_count > 0 && (
                              <p className="text-[10px] text-emerald-400">🔥 {p.hot_count} 組很有興趣</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Monthly trend */}
                {showingStats.trend.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-black text-glacier-500 uppercase tracking-[0.12em] mb-3">近 6 個月帶看趨勢</p>
                    <div className="flex items-end gap-2 h-16">
                      {(() => {
                        const max = Math.max(...showingStats.trend.map((t) => t.cnt), 1);
                        return showingStats.trend.map((t) => (
                          <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[9px] text-aurora-400 font-bold">{t.cnt}</span>
                            <div
                              className="w-full bg-aurora-500/70 rounded-t"
                              style={{ height: `${Math.max((t.cnt / max) * 48, 4)}px` }}
                            />
                            <span className="text-[8px] text-glacier-600">
                              {t.month.slice(5)}月
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Status stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                filterStatus === s ? STATUS_STYLE[s] + " scale-105 shadow-md" : `${STATUS_STAT_IDLE[s]} hover:scale-[1.03] hover:shadow-sm`
              }`}>
              <span className="text-xl font-black leading-none">{statusCounts[s] ?? 0}</span>
              <span className="text-[10px] font-bold tracking-wide">{s}</span>
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-glacier-500" />
            <input type="text" placeholder="搜尋姓名、電話、區域..."
              className="w-full pl-9 pr-3 py-2 bg-titanium-900 border border-glacier-200/[0.08] rounded-lg text-xs text-glacier-300 placeholder:text-glacier-600 focus:outline-none focus:border-aurora-500/40"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {(filterStatus || search) && (
            <button onClick={() => { setFilterStatus(""); setSearch(""); }}
              className="text-xs text-glacier-500 hover:text-glacier-200 transition-colors">清除篩選</button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-titanium-900 rounded-xl p-4 space-y-3 border border-glacier-200/[0.07] animate-pulse h-48" />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 bg-red-500/10 border-2 border-dashed border-red-500/30 rounded-xl">
            <Users className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-sm font-medium text-red-400">載入失敗，請重試</p>
            <button onClick={load} className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-400 transition-all">
              重新載入
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-titanium-900 border-2 border-dashed border-glacier-200/[0.08] rounded-xl">
            <Users className="w-12 h-12 text-glacier-600 mb-3" />
            <p className="text-sm font-medium text-glacier-400">{filterStatus || search ? "找不到符合的買方" : "尚無買方資料"}</p>
            <p className="text-xs text-glacier-600 mt-1">點擊「新增買方」開始建立 CRM</p>
            <button onClick={openAdd}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all">
              <Plus className="w-4 h-4" /> 新增買方
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-w-2xl mx-auto lg:max-w-none lg:grid lg:grid-cols-2 xl:grid-cols-2">
            {filtered.map((b) => {
              const buyerShowings = showingsMap[b.id] ?? [];
              const isExpanded    = expandedBuyers.has(b.id);
              const visibleShowings = isExpanded ? buyerShowings : buyerShowings.slice(0, 2);

              return (
                <div key={b.id} className={`bg-white border-2 ${STATUS_LEFT_BORDER[b.status] ?? ""} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col`}>

                  {/* Card header */}
                  <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-14 h-14 rounded-2xl ${STATUS_AVATAR[b.status]?.bg ?? "bg-aurora-100 border-aurora-300"} border-2 flex items-center justify-center shrink-0`}>
                        <span className={`text-2xl font-black ${STATUS_AVATAR[b.status]?.text ?? "text-aurora-600"}`}>{b.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xl font-black text-slate-800 leading-tight">{b.name}</p>
                          {b.buyer_no && (
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-aurora-500/10 text-aurora-600 border border-aurora-500/25 tracking-wider">
                              {b.buyer_no}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5 font-medium">{b.source} · {new Date(b.created_at).toLocaleDateString("zh-TW")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => openEdit(b)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-aurora-500 hover:bg-aurora-500/10 transition-all">
                        <Pencil className="w-4.5 h-4.5" style={{width:'18px',height:'18px'}} />
                      </button>
                      <button onClick={() => handleDelete(b.id)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4.5 h-4.5" style={{width:'18px',height:'18px'}} />
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-4 flex-1">
                    {/* Contact */}
                    <div className="space-y-2.5">
                      {b.phone && (
                        <a href={`tel:${b.phone}`} className="flex items-center gap-3 group/tel">
                          <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4 text-teal-600" />
                          </div>
                          <span className="text-base font-semibold text-slate-700 group-hover/tel:text-teal-600 transition-colors">{b.phone}</span>
                        </a>
                      )}
                      {b.line_id && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                            <MessageCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-base font-semibold text-slate-700">LINE: {b.line_id}</span>
                        </div>
                      )}
                      {b.email && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-base font-semibold text-slate-700 truncate">{b.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Budget */}
                    {(b.budget_min > 0 || b.budget_max > 0) && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200">
                        <Target className="w-5 h-5 text-aurora-500 shrink-0" />
                        <span className="text-lg font-black text-amber-700">
                          {b.budget_min > 0 && b.budget_max > 0
                            ? `${b.budget_min.toLocaleString()} – ${b.budget_max.toLocaleString()} 萬`
                            : b.budget_max > 0 ? `上限 ${b.budget_max.toLocaleString()} 萬`
                            : `${b.budget_min.toLocaleString()} 萬起`}
                        </span>
                      </div>
                    )}

                    {/* Preferences */}
                    <div className="flex flex-wrap gap-2">
                      {b.pref_property_type && (
                        <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                          <Home className="w-3.5 h-3.5" />{b.pref_property_type}
                        </span>
                      )}
                      {b.pref_area && (
                        <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                          <MapPin className="w-3.5 h-3.5" />{b.pref_area}
                        </span>
                      )}
                      {b.pref_rooms && (
                        <span className="text-sm px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 font-semibold">
                          {b.pref_rooms}
                        </span>
                      )}
                      {b.pref_min_ping > 0 && (
                        <span className="text-sm px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 font-semibold">
                          {b.pref_min_ping}坪以上
                        </span>
                      )}
                    </div>

                    {/* Last contact */}
                    {b.last_contact_at && (
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="text-sm text-indigo-600 font-semibold">
                          上次聯繫：{new Date(b.last_contact_at).toLocaleDateString("zh-TW")}
                        </span>
                      </div>
                    )}

                    {/* Next follow-up date */}
                    {b.next_follow_up_date && (() => {
                      const d = b.next_follow_up_date.slice(0, 10);
                      const isOverdue = d < todayStr;
                      const isToday = d === todayStr;
                      return (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                          isOverdue ? "bg-red-50 border-red-300" : isToday ? "bg-amber-50 border-amber-300" : "bg-blue-50 border-blue-200"
                        }`}>
                          <Bell className={`w-5 h-5 shrink-0 ${isOverdue ? "text-red-500" : isToday ? "text-amber-600" : "text-blue-500"}`} />
                          <span className={`text-base font-bold ${isOverdue ? "text-red-700" : isToday ? "text-amber-800" : "text-blue-700"}`}>
                            {isOverdue ? "⚠ 逾期追蹤：" : isToday ? "今日需追蹤：" : "下次追蹤："}
                            {new Date(d).toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}
                          </span>
                        </div>
                      );
                    })()}

                    {/* 備註 */}
                    {b.notes && (
                      <div className="border-t border-slate-100 pt-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">備註</p>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{b.notes}</p>
                      </div>
                    )}

                    {/* 回訪記錄 */}
                    {b.visit_log && (
                      <div className={`${b.notes ? "" : "border-t border-slate-100 pt-3"}`}>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1.5">回訪記錄</p>
                        <div className="space-y-1">
                          {b.visit_log.split("\n").filter(Boolean).slice(0, 4).map((line, i) => (
                            <p key={i} className="text-sm text-slate-600 leading-relaxed">{line}</p>
                          ))}
                          {b.visit_log.split("\n").filter(Boolean).length > 4 && (
                            <p className="text-xs text-slate-400 italic">…更多記錄</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Showings section ── */}
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">帶看紀錄</span>
                          {buyerShowings.length > 0 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-aurora-500/10 text-aurora-600 border border-aurora-500/20">
                              {buyerShowings.length}筆
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => openShowingModal(b)}
                          className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl bg-aurora-500/10 text-aurora-600 border border-aurora-500/25 hover:bg-aurora-500/20 transition-all">
                          <Plus className="w-3.5 h-3.5" />帶看
                        </button>
                      </div>

                      {buyerShowings.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">尚未有帶看紀錄</p>
                      ) : (
                        <div className="space-y-2.5">
                          {visibleShowings.map((s) => {
                            const cfg = REACTION_MINI[s.reaction] ?? REACTION_MINI["普通"];
                            const RIcon = cfg.icon;
                            const propTitle = getPropertyTitle(s.property_id);
                            return (
                              <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} shrink-0 mt-1.5`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="text-sm font-bold text-slate-700 shrink-0">
                                      {new Date(s.showing_date).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })}
                                    </span>
                                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                                      <RIcon className="w-3 h-3" />{s.reaction}
                                    </span>
                                    {s.offer_wan > 0 && (
                                      <span className="flex items-center gap-1 text-xs font-bold text-white bg-aurora-500 px-2 py-0.5 rounded-full">
                                        <TrendingUp className="w-3 h-3" />{s.offer_wan.toLocaleString()}萬
                                      </span>
                                    )}
                                  </div>
                                  {propTitle && (
                                    <p className="text-sm font-semibold text-slate-700 leading-snug">{propTitle}</p>
                                  )}
                                  {s.follow_up && (
                                    <div className="mt-1.5 flex items-start gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-2">
                                      <Bell className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
                                      <div>
                                        <p className="text-[10px] font-bold text-blue-600 mb-0.5">追蹤事項</p>
                                        <p className="text-xs text-blue-900 leading-relaxed">{s.follow_up.split('\n')[0]}</p>
                                      </div>
                                    </div>
                                  )}
                                  {s.notes && (
                                    <p className="text-xs text-slate-500 mt-1 pl-1">備註：{s.notes}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => openEditShowing(b, s)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                    title="編輯">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteShowing(s.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    title="刪除">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {buyerShowings.length > 2 && (
                            <button onClick={() => toggleExpand(b.id)}
                              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-aurora-500 transition-colors font-semibold">
                              {isExpanded
                                ? <><ChevronUp className="w-4 h-4" />收起</>
                                : <><ChevronDown className="w-4 h-4" />還有 {buyerShowings.length - 2} 筆紀錄</>}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status footer */}
                  <div className="px-5 pb-5 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          className={`w-full appearance-none text-base font-bold px-4 py-3 pr-9 rounded-xl border-2 cursor-pointer focus:outline-none transition-all ${STATUS_STYLE[b.status] ?? STATUS_STYLE["潛在"]}`}
                          value={b.status} onChange={(e) => handleStatusChange(b, e.target.value)}>
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60" />
                      </div>
                      {b.status === "已成交" && <BadgeCheck className="w-6 h-6 text-emerald-500 shrink-0" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Add Showing Modal ── */}
      {showShowingModal && showingTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-aurora-500">
                  <CalendarCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-glacier-200">
                    {editShowing ? "編輯帶看紀錄" : "新增帶看紀錄"}
                  </h2>
                  <p className="text-[10px] text-glacier-500 mt-0.5">
                    <span className={`inline-flex items-center gap-1 font-bold ${STATUS_AVATAR[showingTarget.status]?.text ?? "text-aurora-600"}`}>
                      {showingTarget.name}
                    </span>
                    {showingTarget.phone && ` · ${showingTarget.phone}`}
                  </p>
                </div>
              </div>
              <button onClick={closeShowingModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>帶看日期 *</label>
                  <input type="date" className={inputCls} value={showingForm.showing_date}
                    onChange={(e) => setShowingForm((f) => ({ ...f, showing_date: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>帶看物件</label>
                  <select className={inputCls + " cursor-pointer"} value={showingForm.property_id}
                    onChange={(e) => setShowingForm((f) => ({ ...f, property_id: e.target.value }))}>
                    <option value="">未指定</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.listing_id ? `[${p.listing_id}] ` : ""}{p.subarea} {p.property_type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reaction quick-select */}
              <div>
                <label className={labelCls}>買方反應</label>
                <div className="flex gap-2 flex-wrap mt-1.5">
                  {REACTIONS.map((r) => {
                    const Icon = REACTION_MINI[r].icon;
                    return (
                      <button key={r} type="button"
                        onClick={() => setShowingForm((f) => ({ ...f, reaction: r }))}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${
                          showingForm.reaction === r
                            ? REACTION_QUICK_STYLE[r] + " scale-105 shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}>
                        <Icon className="w-3.5 h-3.5" />{r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelCls}>出價意向（萬，0 = 無出價）</label>
                <input type="number" className={inputCls} value={showingForm.offer_wan}
                  onChange={(e) => setShowingForm((f) => ({ ...f, offer_wan: e.target.value }))}
                  placeholder="例：850" min="0" />
              </div>

              <div>
                <label className={labelCls}>追蹤事項</label>
                <textarea className={inputCls + " resize-none"} rows={2} value={showingForm.follow_up}
                  onChange={(e) => setShowingForm((f) => ({ ...f, follow_up: e.target.value }))}
                  placeholder="例：3天後再電聯確認意願..." />
              </div>

              <div>
                <label className={labelCls + " text-blue-600"}>🔔 下次回訪日（自動加入每日重點）</label>
                <input type="date" className={inputCls + " border-blue-200 focus:border-blue-400"} value={showingForm.follow_up_date}
                  onChange={(e) => setShowingForm((f) => ({ ...f, follow_up_date: e.target.value }))} />
              </div>

              <div>
                <label className={labelCls}>備註</label>
                <textarea className={inputCls + " resize-none"} rows={2} value={showingForm.notes}
                  onChange={(e) => setShowingForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="例：買方偏好採光佳的3房格局..." />
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <button onClick={closeShowingModal}
                className="px-4 py-2 text-sm font-medium text-glacier-400 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all">
                取消
              </button>
              <button onClick={handleSaveShowing} disabled={savingShowing}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-aurora-500 rounded-lg hover:bg-aurora-400 disabled:opacity-50 transition-all glow-aurora-sm">
                <Save className="w-3.5 h-3.5" />
                {savingShowing ? "儲存中..." : editShowing ? "儲存修改" : "儲存帶看"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Buyer Drawer ── */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-titanium-900 rounded-t-2xl sm:rounded-2xl border border-glacier-200/[0.07] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-glacier-200/[0.07] shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-aurora-500/10">
                  <Users className="w-4 h-4 text-aurora-500" />
                </div>
                <h2 className="text-sm font-bold text-glacier-200">{editBuyer ? "編輯買方資料" : "新增買方"}</h2>
              </div>
              <button onClick={() => setShowDrawer(false)}
                className="p-1.5 rounded-lg text-glacier-500 hover:text-glacier-200 hover:bg-titanium-800 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, status: s }))}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      form.status === s ? STATUS_STYLE[s] : "bg-titanium-800 border-glacier-200/[0.08] text-glacier-500"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${form.status === s ? STATUS_DOT[s] : "bg-glacier-600"}`} />
                    {s}
                  </button>
                ))}
              </div>
              <div>
                <label className={labelCls}>預算範圍（萬）</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" className={inputCls} placeholder="最低（例：500）" value={form.budget_min}
                    onChange={(e) => setForm((f) => ({ ...f, budget_min: e.target.value }))} min="0" />
                  <input type="number" className={inputCls} placeholder="最高（例：1200）" value={form.budget_max}
                    onChange={(e) => setForm((f) => ({ ...f, budget_max: e.target.value }))} min="0" />
                </div>
              </div>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>最後聯繫日期</label>
                  <input type="date" className={inputCls} value={form.last_contact_at}
                    onChange={(e) => setForm((f) => ({ ...f, last_contact_at: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls + " text-blue-600"}>🔔 下次追蹤日</label>
                  <input type="date" className={inputCls + " border-blue-200 focus:border-blue-400"} value={form.next_follow_up_date}
                    onChange={(e) => setForm((f) => ({ ...f, next_follow_up_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>備註</label>
                <textarea className={inputCls + " resize-none"} rows={2} value={form.notes}
                  placeholder="客戶偏好、注意事項、特殊條件等..."
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls + " text-indigo-600"}>📋 回訪記錄</label>
                <textarea className={inputCls + " resize-none font-mono text-xs"} rows={4} value={form.visit_log}
                  placeholder={"[2026/4/23] 先不看了\n[2026/4/20] 要三房，不考慮二房"}
                  onChange={(e) => setForm((f) => ({ ...f, visit_log: e.target.value }))} />
                <p className="text-xs text-slate-400 mt-1">每行一筆，系統「完成」追蹤時會自動加入日期記錄</p>
              </div>
            </div>

            {saveError && (
              <div className="px-5 pb-2">
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{saveError}</p>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-glacier-200/[0.07] shrink-0">
              <button onClick={() => setShowDrawer(false)}
                className="px-4 py-2 text-sm font-medium text-glacier-400 bg-titanium-800 border border-glacier-200/[0.08] rounded-lg hover:text-glacier-200 transition-all">
                取消
              </button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 disabled:opacity-50 transition-all glow-aurora-sm">
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
