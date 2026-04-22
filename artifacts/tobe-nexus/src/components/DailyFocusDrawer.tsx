"use client";

import {
  X, Phone, MapPin, Wallet, StickyNote, Clock,
  Building, Building2, CalendarCheck, Handshake, CheckCircle2,
  ChevronRight, PenLine, Save,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { DailyFocusItem } from "@/types";

/* ── Row in the drawer ─────────────────────────────────────────────── */
function DetailRow({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="shrink-0 text-slate-400 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800 break-words">{String(value)}</p>
      </div>
    </div>
  );
}

/* ── Accumulated history display ──────────────────────────────────── */
function HistoryBlock({ history, color = "blue" }: { history: string; color?: "blue" | "amber" }) {
  if (!history.trim()) return null;
  const bg = color === "amber" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200";
  const title = color === "amber" ? "text-amber-700" : "text-blue-700";
  const text = color === "amber" ? "text-amber-900" : "text-blue-900";
  return (
    <div className={`rounded-xl border px-3.5 py-3 ${bg}`}>
      <p className={`text-[10px] font-bold mb-1.5 ${title}`}>累積記錄</p>
      <p className={`text-xs leading-relaxed whitespace-pre-wrap ${text}`}>{history.trim()}</p>
    </div>
  );
}

/* ── Notes input block ─────────────────────────────────────────────── */
function todayBadge() {
  const d = new Date();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function NoteInput({
  label, placeholder, value, onChange, isDone, showDate = true,
}: {
  label: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  isDone?: boolean; showDate?: boolean;
}) {
  return (
    <div className="pt-3">
      <div className="flex items-center gap-2 mb-2">
        <PenLine className="w-4 h-4 text-blue-500" />
        <p className="text-xs font-bold text-blue-700">{label}</p>
        {showDate && !isDone && (
          <span className="ml-auto text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
            {todayBadge()} 記錄
          </span>
        )}
      </div>
      {isDone ? (
        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 leading-relaxed whitespace-pre-wrap">
          {value || "（無紀錄）"}
        </p>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full text-sm text-slate-800 bg-blue-50/60 border border-blue-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-slate-400 leading-relaxed"
        />
      )}
    </div>
  );
}

/* ── Per-type detail sections ──────────────────────────────────────── */
interface DetailData {
  phone?: string;
  budget_min?: number;
  budget_max?: number;
  pref_property_type?: string;
  pref_area?: string;
  pref_rooms?: string;
  next_follow_up_date?: string | null;
  notes?: string;
  buyer_name?: string;
  buyer_phone?: string;
  showing_date?: string;
  reaction?: string;
  follow_up?: string;
  follow_up_date?: string | null;
  listing_id?: string;
  subarea?: string;
  property_type?: string;
  colisting_company?: string;
  colisting_contact?: string;
  colisting_last_check?: string | null;
  colisting_notes?: string;
  contract_end_date?: string;
  status_now?: string;
  price_wan?: number;
  address_note?: string;
  owner_follow_up_notes?: string;
}

function BuyerDetail({ d, noteInput, setNoteInput, isDone }: {
  d: DetailData; noteInput: string; setNoteInput: (v: string) => void; isDone: boolean;
}) {
  const budget = d.budget_min || d.budget_max
    ? `${d.budget_min ?? 0} ~ ${d.budget_max ?? 0} 萬` : null;
  return (
    <>
      <DetailRow icon={<Phone className="w-4 h-4" />}      label="聯絡電話" value={d.phone} />
      <DetailRow icon={<Wallet className="w-4 h-4" />}     label="預算範圍" value={budget} />
      <DetailRow icon={<Building2 className="w-4 h-4" />}  label="偏好房型" value={d.pref_property_type} />
      <DetailRow icon={<MapPin className="w-4 h-4" />}     label="偏好區域" value={d.pref_area} />
      <DetailRow icon={<Building className="w-4 h-4" />}   label="偏好格局" value={d.pref_rooms ? `${d.pref_rooms}房` : null} />
      <DetailRow icon={<Clock className="w-4 h-4" />}      label="下次追蹤" value={d.next_follow_up_date} />
      {d.notes && <HistoryBlock history={d.notes} color="blue" />}
      <NoteInput
        label="這次追蹤事項"
        placeholder="例：對方說預算可能提高，請下週再報新案..."
        value={noteInput}
        onChange={setNoteInput}
        isDone={isDone}
      />
    </>
  );
}

function ShowingDetail({ d, noteInput, setNoteInput, isDone }: {
  d: DetailData; noteInput: string; setNoteInput: (v: string) => void; isDone: boolean;
}) {
  return (
    <>
      <DetailRow icon={<Phone className="w-4 h-4" />}         label="買方電話" value={d.buyer_phone} />
      <DetailRow icon={<CalendarCheck className="w-4 h-4" />} label="帶看日期" value={d.showing_date} />
      <DetailRow icon={<StickyNote className="w-4 h-4" />}    label="買方反應" value={d.reaction} />
      <DetailRow icon={<Clock className="w-4 h-4" />}         label="回訪日期" value={d.follow_up_date} />
      {d.follow_up && <HistoryBlock history={d.follow_up} color="blue" />}
      <NoteInput
        label="這次追蹤事項"
        placeholder="例：傳新物件、確認下次帶看時間、對方說預算可以提高..."
        value={noteInput}
        onChange={setNoteInput}
        isDone={isDone}
      />
    </>
  );
}

function ColistingDetail({ d, noteInput, setNoteInput, isDone }: {
  d: DetailData; noteInput: string; setNoteInput: (v: string) => void; isDone: boolean;
}) {
  return (
    <>
      <DetailRow icon={<Building2 className="w-4 h-4" />}   label="物件編號"  value={d.listing_id} />
      <DetailRow icon={<MapPin className="w-4 h-4" />}       label="地段"      value={d.subarea} />
      <DetailRow icon={<Handshake className="w-4 h-4" />}    label="合作公司"  value={d.colisting_company} />
      <DetailRow icon={<Phone className="w-4 h-4" />}        label="窗口聯絡"  value={d.colisting_contact} />
      <DetailRow icon={<Clock className="w-4 h-4" />}        label="上次詢問"  value={d.colisting_last_check ?? "尚未詢問過"} />
      {d.colisting_notes && <HistoryBlock history={d.colisting_notes} color="blue" />}
      <NoteInput
        label="這次詢問說了什麼"
        placeholder="例：對方說有意願，要確認業主同意再回覆..."
        value={noteInput}
        onChange={setNoteInput}
        isDone={isDone}
      />
    </>
  );
}

function PropertyDetail({ d, noteInput, setNoteInput }: {
  d: DetailData; noteInput: string; setNoteInput: (v: string) => void;
}) {
  return (
    <>
      <DetailRow icon={<Building2 className="w-4 h-4" />}  label="物件編號"  value={d.listing_id} />
      <DetailRow icon={<MapPin className="w-4 h-4" />}      label="地段"      value={d.subarea} />
      <DetailRow icon={<Wallet className="w-4 h-4" />}      label="開價"      value={d.price_wan ? `${d.price_wan} 萬` : null} />
      <DetailRow icon={<Clock className="w-4 h-4" />}       label="委託到期"  value={d.contract_end_date} />
      <DetailRow icon={<StickyNote className="w-4 h-4" />}  label="目前狀態"  value={d.status_now} />
      <DetailRow icon={<MapPin className="w-4 h-4" />}      label="地址備註"  value={d.address_note} />
      {d.owner_follow_up_notes && <HistoryBlock history={d.owner_follow_up_notes} color="amber" />}
      <NoteInput
        label="客戶經營記錄（賣方）"
        placeholder="例：屋主今天說最低可以談 900，下週再確認是否降價..."
        value={noteInput}
        onChange={setNoteInput}
      />
    </>
  );
}

/* ── Main drawer component ─────────────────────────────────────────── */
const TYPE_LABEL: Record<string, string> = {
  buyer: "買方 CRM", showing: "帶看回訪", colisting: "同業聯賣", property: "案件委託",
};

function todayLabel() {
  const d = new Date();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function DailyFocusDrawer({
  item, onClose, onDone,
}: {
  item: DailyFocusItem | null;
  onClose: () => void;
  onDone: (item: DailyFocusItem) => void;
}) {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item) { setDetail(null); setNoteInput(""); return; }
    setLoading(true);
    const url =
      item.type === "buyer"   ? `/api/buyers/${item.source_id}` :
      item.type === "showing" ? `/api/showings/${item.source_id}` :
      `/api/properties/${item.source_id}`;

    fetch(url)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        setDetail(data);
        // All types: blank textarea; history shown separately in HistoryBlock
      })
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [item]);

  if (!item) return null;

  const canComplete = item.type !== "property";
  const overdueDays = item.is_overdue
    ? Math.ceil((Date.now() - new Date(item.date).getTime()) / 86400000)
    : 0;
  const typeLabel = TYPE_LABEL[item.type] ?? item.type;

  const handleComplete = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const prefix = `[${todayLabel()}] `;

      if (item.type === "buyer" && noteInput.trim()) {
        const newNote = prefix + noteInput.trim();
        const existing = detail?.notes?.trim() ?? "";
        const merged = existing ? `${newNote}\n${existing}` : newNote;
        await fetch(`/api/buyers/${item.source_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ next_follow_up_date: null, notes: merged }),
        });
      }

      if (item.type === "showing" && noteInput.trim()) {
        const newEntry = `[${todayLabel()}] ${noteInput.trim()}`;
        const existing = detail?.follow_up?.trim() ?? "";
        const merged = existing ? `${newEntry}\n${existing}` : newEntry;
        await fetch(`/api/showings/${item.source_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ follow_up_done: true, follow_up: merged }),
        });
      } else if (item.type === "showing") {
        await fetch(`/api/showings/${item.source_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ follow_up_done: true }),
        });
      }

      if (item.type === "colisting" && noteInput.trim()) {
        const newEntry = `[${todayLabel()}] ${noteInput.trim()}`;
        const existing = detail?.colisting_notes?.trim() ?? "";
        const merged = existing ? `${newEntry}\n${existing}` : newEntry;
        await fetch(`/api/properties/${item.source_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ colisting_last_check: today, colisting_notes: merged }),
        });
      } else if (item.type === "colisting") {
        await fetch(`/api/properties/${item.source_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ colisting_last_check: today }),
        });
      }

      onDone(item);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSavePropertyNotes = async () => {
    if (!noteInput.trim()) { onClose(); return; }
    setSaving(true);
    try {
      const prefix = `[${todayLabel()}] `;
      const newNote = prefix + noteInput.trim();
      const existing = detail?.owner_follow_up_notes?.trim() ?? "";
      const merged = existing ? `${newNote}\n${existing}` : newNote;
      await fetch(`/api/properties/${item.source_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_follow_up_notes: merged }),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-3 pb-4 border-b border-slate-100">
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mt-0.5 shrink-0 ${
            item.is_overdue ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
          }`}>
            <span>{typeLabel}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-lg font-black leading-tight ${item.is_overdue ? "text-red-900" : "text-slate-900"}`}>
              {item.title}
            </p>
            {item.is_overdue && (
              <span className="inline-block mt-1 text-xs font-black bg-red-600 text-white px-2 py-0.5 rounded-lg">
                逾期 {overdueDays} 天
              </span>
            )}
          </div>
          <button onClick={onClose} className="shrink-0 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="space-y-3 py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : detail ? (
            <div className="pb-4">
              {item.type === "buyer" && (
                <BuyerDetail d={detail} noteInput={noteInput} setNoteInput={setNoteInput} isDone={item.done} />
              )}
              {item.type === "showing" && (
                <ShowingDetail d={detail} noteInput={noteInput} setNoteInput={setNoteInput} isDone={item.done} />
              )}
              {item.type === "colisting" && (
                <ColistingDetail d={detail} noteInput={noteInput} setNoteInput={setNoteInput} isDone={item.done} />
              )}
              {item.type === "property" && (
                <PropertyDetail d={detail} noteInput={noteInput} setNoteInput={setNoteInput} />
              )}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8 text-sm">無法載入詳細資料</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            關閉
          </button>

          {/* Buyer / Showing / Colisting — 完成 button */}
          {canComplete && !item.done && (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-black text-sm transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {saving ? "儲存中..." : "完成"}
            </button>
          )}

          {/* Property — 儲存記錄 button (only when there's content) */}
          {item.type === "property" && noteInput.trim() && (
            <button
              onClick={handleSavePropertyNotes}
              disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-black text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? "儲存中..." : "儲存記錄"}
            </button>
          )}
          {/* Property — 前往案件 */}
          {item.type === "property" && (
            <Link
              href="/properties"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-black text-sm transition-colors text-center flex items-center justify-center"
            >
              前往案件
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
