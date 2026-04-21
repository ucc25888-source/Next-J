"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePropertyStore } from "@/store/usePropertyStore";
import PageHeader from "@/components/PageHeader";
import {
  Plus, Users, Phone, Mail, MessageCircle,
  X, Save, Pencil, Trash2, Search, ChevronDown,
  Target, Home, MapPin, BadgeCheck, Clock,
  CalendarCheck, Star, Smile, Meh, Frown, TrendingUp,
  ChevronUp, MessageSquare,
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
  status: "潛在", notes: "", last_contact_at: "",
};
type FormState = typeof blankForm;

const blankShowingForm = {
  showing_date: todayStr, property_id: "",
  reaction: "有點興趣", offer_wan: "", follow_up: "", notes: "",
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
    status: b.status, notes: b.notes, last_contact_at: b.last_contact_at ?? "",
  };
}

export default function BuyersPage() {
  const properties = usePropertyStore((s) => s.properties);

  const [buyers, setBuyers]           = useState<Buyer[]>([]);
  const [allShowings, setAllShowings] = useState<Showing[]>([]);
  const [loading, setLoading]         = useState(true);

  const [showDrawer, setShowDrawer]       = useState(false);
  const [editBuyer, setEditBuyer]         = useState<Buyer | null>(null);
  const [form, setForm]                   = useState<FormState>({ ...blankForm });
  const [saving, setSaving]               = useState(false);
  const [filterStatus, setFilterStatus]   = useState("");
  const [search, setSearch]               = useState("");

  const [showShowingModal, setShowShowingModal]       = useState(false);
  const [showingTarget, setShowingTarget]             = useState<Buyer | null>(null);
  const [showingForm, setShowingForm]                 = useState({ ...blankShowingForm });
  const [savingShowing, setSavingShowing]             = useState(false);
  const [expandedBuyers, setExpandedBuyers]           = useState<Set<string>>(new Set());

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
    try {
      const [bRes, sRes] = await Promise.all([fetch("/api/buyers"), fetch("/api/showings")]);
      if (bRes.ok) setBuyers((await bRes.json()).buyers ?? []);
      if (sRes.ok) setAllShowings((await sRes.json()).showings ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditBuyer(null); setForm({ ...blankForm }); setShowDrawer(true); };
  const openEdit = (b: Buyer) => { setEditBuyer(b); setForm(toForm(b)); setShowDrawer(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
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
        if (res.ok) { const d = await res.json(); setBuyers((p) => p.map((b) => b.id === editBuyer.id ? d.buyer : b)); setShowDrawer(false); }
      } else {
        const res = await fetch("/api/buyers", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        if (res.ok) { const d = await res.json(); setBuyers((p) => [d.buyer, ...p]); setShowDrawer(false); }
      }
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
    if (res.ok) { const d = await res.json(); setBuyers((p) => p.map((b) => b.id === buyer.id ? d.buyer : b)); }
  };

  const openShowingModal = (buyer: Buyer) => {
    setShowingTarget(buyer);
    setShowingForm({ ...blankShowingForm });
    setShowShowingModal(true);
  };

  const handleSaveShowing = async () => {
    if (!showingTarget) return;
    setSavingShowing(true);
    try {
      const res = await fetch("/api/showings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_id:     showingTarget.id,
          buyer_name:   showingTarget.name,
          buyer_phone:  showingTarget.phone,
          buyer_source: showingTarget.source,
          property_id:  showingForm.property_id || null,
          showing_date: showingForm.showing_date,
          reaction:     showingForm.reaction,
          offer_wan:    Number(showingForm.offer_wan) || 0,
          follow_up:    showingForm.follow_up,
          notes:        showingForm.notes,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setAllShowings((p) => [d.showing, ...p]);
        setShowShowingModal(false);
      }
    } finally { setSavingShowing(false); }
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => {
              const buyerShowings = showingsMap[b.id] ?? [];
              const isExpanded    = expandedBuyers.has(b.id);
              const visibleShowings = isExpanded ? buyerShowings : buyerShowings.slice(0, 2);

              return (
                <div key={b.id} className={`bg-titanium-900 border border-glacier-200/[0.12] ${STATUS_LEFT_BORDER[b.status] ?? ""} rounded-xl overflow-hidden hover:shadow-md transition-all group flex flex-col`}>

                  {/* Card header */}
                  <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-glacier-200/[0.06]">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-9 h-9 rounded-full ${STATUS_AVATAR[b.status]?.bg ?? "bg-aurora-100 border-aurora-300"} border-2 flex items-center justify-center shrink-0`}>
                        <span className={`text-sm font-black ${STATUS_AVATAR[b.status]?.text ?? "text-aurora-600"}`}>{b.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-glacier-200 leading-tight">{b.name}</p>
                          {b.buyer_no && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-aurora-500/10 text-aurora-500 border border-aurora-500/20 tracking-wider">
                              {b.buyer_no}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-glacier-500 mt-0.5">{b.source} · {new Date(b.created_at).toLocaleDateString("zh-TW")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(b)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-glacier-600 hover:text-aurora-400 hover:bg-aurora-500/[0.08] transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(b.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-glacier-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1">
                    {/* Contact */}
                    <div className="space-y-1.5">
                      {b.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-teal-500 shrink-0" />
                          <a href={`tel:${b.phone}`} className="text-xs text-glacier-400 hover:text-teal-600 transition-colors">{b.phone}</a>
                        </div>
                      )}
                      {b.line_id && (
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-3 h-3 text-green-500 shrink-0" />
                          <span className="text-xs text-glacier-400">{b.line_id}</span>
                        </div>
                      )}
                      {b.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="text-xs text-glacier-400 truncate">{b.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Budget */}
                    {(b.budget_min > 0 || b.budget_max > 0) && (
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-aurora-500 shrink-0" />
                        <span className="text-xs font-semibold text-aurora-400">
                          {b.budget_min > 0 && b.budget_max > 0
                            ? `${b.budget_min.toLocaleString()} – ${b.budget_max.toLocaleString()} 萬`
                            : b.budget_max > 0 ? `上限 ${b.budget_max.toLocaleString()} 萬`
                            : `${b.budget_min.toLocaleString()} 萬起`}
                        </span>
                      </div>
                    )}

                    {/* Preferences */}
                    <div className="flex flex-wrap gap-1.5">
                      {b.pref_property_type && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-medium">
                          <Home className="w-2.5 h-2.5" />{b.pref_property_type}
                        </span>
                      )}
                      {b.pref_area && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-medium">
                          <MapPin className="w-2.5 h-2.5" />{b.pref_area}
                        </span>
                      )}
                      {b.pref_rooms && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200 font-medium">
                          {b.pref_rooms}
                        </span>
                      )}
                      {b.pref_min_ping > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200 font-medium">
                          {b.pref_min_ping}坪以上
                        </span>
                      )}
                    </div>

                    {/* Last contact */}
                    {b.last_contact_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="text-[11px] text-indigo-500 font-medium">
                          聯繫：{new Date(b.last_contact_at).toLocaleDateString("zh-TW")}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {b.notes && (
                      <p className="text-[11px] text-glacier-500 leading-relaxed line-clamp-2 border-t border-glacier-200/[0.06] pt-2">{b.notes}</p>
                    )}

                    {/* ── Showings section ── */}
                    <div className="border-t border-glacier-200/[0.08] pt-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CalendarCheck className="w-3 h-3 text-glacier-500" />
                          <span className="text-[10px] font-bold text-glacier-400 uppercase tracking-wide">帶看紀錄</span>
                          {buyerShowings.length > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-aurora-500/10 text-aurora-400 border border-aurora-500/20">
                              {buyerShowings.length}筆
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => openShowingModal(b)}
                          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-aurora-500/10 text-aurora-400 border border-aurora-500/20 hover:bg-aurora-500/20 transition-all">
                          <Plus className="w-2.5 h-2.5" />帶看
                        </button>
                      </div>

                      {buyerShowings.length === 0 ? (
                        <p className="text-[10px] text-glacier-600 italic">尚未有帶看紀錄</p>
                      ) : (
                        <div className="space-y-1.5">
                          {visibleShowings.map((s) => {
                            const cfg = REACTION_MINI[s.reaction] ?? REACTION_MINI["普通"];
                            const RIcon = cfg.icon;
                            const propTitle = getPropertyTitle(s.property_id);
                            return (
                              <div key={s.id} className="flex items-start gap-2 group/row">
                                <div className="flex flex-col items-center shrink-0 pt-0.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-semibold text-glacier-400 shrink-0">
                                      {new Date(s.showing_date).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })}
                                    </span>
                                    <span className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>
                                      <RIcon className="w-2.5 h-2.5" />{s.reaction}
                                    </span>
                                    {s.offer_wan > 0 && (
                                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-white bg-aurora-500 px-1.5 py-0.5 rounded-full">
                                        <TrendingUp className="w-2 h-2" />{s.offer_wan.toLocaleString()}萬
                                      </span>
                                    )}
                                    {propTitle && (
                                      <span className="text-[9px] text-glacier-500 truncate max-w-[100px]">{propTitle}</span>
                                    )}
                                  </div>
                                  {s.follow_up && (
                                    <p className="text-[9px] text-amber-600 mt-0.5 flex items-start gap-1">
                                      <MessageSquare className="w-2.5 h-2.5 shrink-0 mt-0.5" />
                                      <span className="line-clamp-1">{s.follow_up}</span>
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDeleteShowing(s.id)}
                                  className="opacity-0 group-hover/row:opacity-100 p-0.5 rounded text-glacier-600 hover:text-red-400 transition-all shrink-0">
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            );
                          })}
                          {buyerShowings.length > 2 && (
                            <button onClick={() => toggleExpand(b.id)}
                              className="flex items-center gap-1 text-[10px] text-glacier-500 hover:text-aurora-400 transition-colors font-medium">
                              {isExpanded
                                ? <><ChevronUp className="w-2.5 h-2.5" />收起</>
                                : <><ChevronDown className="w-2.5 h-2.5" />還有 {buyerShowings.length - 2} 筆</>}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status footer */}
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          className={`w-full appearance-none text-[11px] font-bold px-3 py-1.5 pr-7 rounded-lg border cursor-pointer focus:outline-none transition-all ${STATUS_STYLE[b.status] ?? STATUS_STYLE["潛在"]}`}
                          value={b.status} onChange={(e) => handleStatusChange(b, e.target.value)}>
                          {STATUSES.map((s) => <option key={s} value={s} className="bg-titanium-900 text-glacier-200">{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                      {b.status === "已成交" && <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
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
                  <h2 className="text-sm font-bold text-glacier-200">新增帶看紀錄</h2>
                  <p className="text-[10px] text-glacier-500 mt-0.5">
                    <span className={`inline-flex items-center gap-1 font-bold ${STATUS_AVATAR[showingTarget.status]?.text ?? "text-aurora-600"}`}>
                      {showingTarget.name}
                    </span>
                    {showingTarget.phone && ` · ${showingTarget.phone}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowShowingModal(false)}
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
                <label className={labelCls}>備註</label>
                <textarea className={inputCls + " resize-none"} rows={2} value={showingForm.notes}
                  onChange={(e) => setShowingForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="例：買方偏好採光佳的3房格局..." />
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <button onClick={() => setShowShowingModal(false)}
                className="px-4 py-2 text-sm font-medium text-glacier-400 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all">
                取消
              </button>
              <button onClick={handleSaveShowing} disabled={savingShowing}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-aurora-500 rounded-lg hover:bg-aurora-400 disabled:opacity-50 transition-all glow-aurora-sm">
                <Save className="w-3.5 h-3.5" />
                {savingShowing ? "儲存中..." : "儲存帶看"}
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
              <div>
                <label className={labelCls}>最後聯繫日期</label>
                <input type="date" className={inputCls} value={form.last_contact_at}
                  onChange={(e) => setForm((f) => ({ ...f, last_contact_at: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>備註</label>
                <textarea className={inputCls + " resize-none"} rows={3} value={form.notes}
                  placeholder="客戶偏好、注意事項等..."
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

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
