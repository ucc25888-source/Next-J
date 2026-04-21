import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/* ── BOM + CSV builder ── */
function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '\uFEFF（無資料）\n';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ];
  return '\uFEFF' + lines.join('\r\n'); // UTF-8 BOM for Excel
}

function fmtDate(v: unknown) {
  if (!v) return '';
  const d = v instanceof Date ? v : new Date(String(v));
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
}

const QUERIES: Record<string, (clientId: string) => Promise<Record<string, unknown>[]>> = {

  properties: async (clientId) => {
    const rows = await query(
      `SELECT id, title, location, price, land_price, ping, land_ping,
              property_type, layout, parking,
              highlights, secondary_highlights, target_buyers,
              listing_date, listing_expiry, status,
              colisting_agent, colisting_phone, colisting_fee,
              fb_post_count, created_at
       FROM properties WHERE client_id = $1 ORDER BY created_at DESC`,
      [clientId]
    );
    return rows.map((r) => ({
      物件編號: r.id,
      物件名稱: r.title,
      地址: r.location,
      售價萬: r.price,
      土地價格萬: r.land_price,
      坪數: r.ping,
      地坪: r.land_ping,
      類型: r.property_type,
      格局: r.layout,
      車位: r.parking,
      主賣點: r.highlights,
      次賣點: r.secondary_highlights,
      目標客群: r.target_buyers,
      委託日期: fmtDate(r.listing_date),
      委託到期: fmtDate(r.listing_expiry),
      狀態: r.status,
      同業聯賣代理人: r.colisting_agent,
      同業聯賣電話: r.colisting_phone,
      同業服務費: r.colisting_fee,
      FB文案次數: r.fb_post_count,
      建立時間: fmtDate(r.created_at),
    }));
  },

  buyers: async (clientId) => {
    const rows = await query(
      `SELECT id, name, phone, email, source, status,
              budget_min, budget_max, preferred_area, preferred_type,
              notes, next_follow_up_date, created_at
       FROM buyers WHERE client_id = $1 ORDER BY created_at DESC`,
      [clientId]
    );
    return rows.map((r) => ({
      買方編號: r.id,
      姓名: r.name,
      電話: r.phone,
      Email: r.email,
      來源: r.source,
      狀態: r.status,
      預算下限萬: r.budget_min,
      預算上限萬: r.budget_max,
      偏好地區: r.preferred_area,
      偏好類型: r.preferred_type,
      備注: r.notes,
      下次跟進日: r.next_follow_up_date,
      建立時間: fmtDate(r.created_at),
    }));
  },

  showings: async (clientId) => {
    const rows = await query(
      `SELECT s.id, s.showing_date, s.status, s.reaction,
              s.follow_up_date, s.follow_up_done, s.notes,
              b.name AS buyer_name, b.phone AS buyer_phone,
              p.title AS property_title, p.location AS property_location,
              s.created_at
       FROM showings s
       LEFT JOIN buyers b ON b.id = s.buyer_id
       LEFT JOIN properties p ON p.id = s.property_id
       WHERE s.client_id = $1 ORDER BY s.showing_date DESC`,
      [clientId]
    );
    return rows.map((r) => ({
      帶看編號: r.id,
      帶看日期: fmtDate(r.showing_date),
      買方姓名: r.buyer_name,
      買方電話: r.buyer_phone,
      物件名稱: r.property_title,
      物件地址: r.property_location,
      狀態: r.status,
      反應: r.reaction,
      回訪日期: r.follow_up_date,
      已完成回訪: r.follow_up_done ? '是' : '否',
      備注: r.notes,
      建立時間: fmtDate(r.created_at),
    }));
  },

  ai_logs: async (clientId) => {
    const rows = await query(
      `SELECT id, client_id, display_name, action, property_id, tokens_used, created_at
       FROM ai_logs
       WHERE ($1 = 'ALL' OR client_id = $1)
       ORDER BY created_at DESC`,
      [clientId]
    );
    return rows.map((r) => ({
      序號: r.id,
      客戶代碼: r.client_id,
      客戶名稱: r.display_name,
      操作: r.action,
      物件編號: r.property_id ?? '',
      消耗Tokens: r.tokens_used,
      執行時間: fmtDate(r.created_at),
    }));
  },

  copies: async (clientId) => {
    const rows = await query(
      `SELECT c.id, c.copy_type, c.content, c.created_at,
              p.title AS property_title
       FROM copies c
       LEFT JOIN properties p ON p.id = c.property_id::uuid OR p.id = c.property_id
       WHERE c.client_id = $1 ORDER BY c.created_at DESC`,
      [clientId]
    );
    return rows.map((r) => ({
      文案編號: r.id,
      類型: r.copy_type,
      物件名稱: r.property_title ?? '',
      文案內容: r.content,
      建立時間: fmtDate(r.created_at),
    }));
  },
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ table: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin && !session.clientId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { table } = await context.params;
  const url = new URL(req.url);
  /* Admin can export any client, or pass ?client=ALL for ai_logs */
  const targetClient = session.isAdmin
    ? (url.searchParams.get('client') ?? 'ALL')
    : (session.clientId as string);

  const queryFn = QUERIES[table];
  if (!queryFn) {
    return NextResponse.json({ error: '不支援的資料表' }, { status: 400 });
  }

  try {
    const rows = await queryFn(targetClient);
    const csv = toCSV(rows);

    const now = new Date().toLocaleDateString('zh-TW').replace(/\//g, '');
    const filename = `TOBE_${table}_${now}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (err) {
    console.error('Export error', err);
    return NextResponse.json({ error: '匯出失敗' }, { status: 500 });
  }
}
