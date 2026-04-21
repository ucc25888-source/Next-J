import type { Showing } from '@/types';

export function dbRowToShowing(row: Record<string, unknown>): Showing {
  return {
    id: row.id as string,
    client_id: row.client_id as string,
    buyer_id: (row.buyer_id as string) ?? null,
    property_id: (row.property_id as string) ?? null,
    showing_date: (row.showing_date as string) ?? '',
    buyer_name: (row.buyer_name as string) ?? '',
    buyer_phone: (row.buyer_phone as string) ?? '',
    buyer_source: (row.buyer_source as string) ?? '平台',
    reaction: (row.reaction as string) ?? '有點興趣',
    offer_wan: Number(row.offer_wan) ?? 0,
    follow_up: (row.follow_up as string) ?? '',
    follow_up_date: (row.follow_up_date as string) ?? null,
    follow_up_done: Boolean(row.follow_up_done),
    notes: (row.notes as string) ?? '',
    created_at: (row.created_at as string) ?? new Date().toISOString(),
  };
}
