import type { Buyer } from '@/types';

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
    last_contact_at: (row.last_contact_at as string) ?? null,
    next_follow_up_date: (row.next_follow_up_date as string) ?? null,
    created_at: (row.created_at as string) ?? new Date().toISOString(),
    updated_at: (row.updated_at as string) ?? new Date().toISOString(),
  };
}
