import type { Buyer } from '@/types';

function toDateStr(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

function toISOStr(v: unknown): string {
  if (!v) return new Date().toISOString();
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

export function dbRowToBuyer(row: Record<string, unknown>): Buyer {
  return {
    id: row.id as string,
    client_id: row.client_id as string,
    buyer_no: (row.buyer_no as string) ?? '',
    name: (row.name as string) ?? '',
    phone: (row.phone as string) ?? '',
    email: (row.email as string) ?? '',
    line_id: (row.line_id as string) ?? '',
    source: (row.source as string) ?? '平台',
    budget_min: Number(row.budget_min) ?? 0,
    budget_max: Number(row.budget_max) ?? 0,
    pref_property_type: (row.pref_property_type as string) ?? '',
    pref_area: (row.pref_area as string) ?? '',
    pref_rooms: (row.pref_rooms as string) ?? '',
    pref_min_ping: Number(row.pref_min_ping) ?? 0,
    status: (row.status as string) ?? '潛在',
    notes: (row.notes as string) ?? '',
    last_contact_at: toDateStr(row.last_contact_at),
    next_follow_up_date: toDateStr(row.next_follow_up_date),
    created_at: toISOStr(row.created_at),
    updated_at: toISOStr(row.updated_at),
  };
}
