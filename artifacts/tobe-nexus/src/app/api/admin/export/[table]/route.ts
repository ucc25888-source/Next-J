import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/* ── UTF-8 BOM CSV builder ── */
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
  return '\uFEFF' + lines.join('\r\n');
}

function fmtDate(v: unknown) {
  if (!v) return '';
  const d = v instanceof Date ? v : new Date(String(v));
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
}

const QUERIES: Record<string, (clientId: string) => Promise<Record<string, unknown>[]>> = {

  properties: async (clientId) => {
    const isAll = clientId === 'ALL';
    const rows = await query(
      `SELECT p.*, c.display_name AS client_name
       FROM properties p
       LEFT JOIN clients c ON c.client_id = p.client_id
       ${isAll ? '' : 'WHERE p.client_id = $1'}
       ORDER BY p.created_at DESC`,
      isAll ? [] : [clientId]
    );
    return rows.map((r) => ({
      ...(isAll ? { 所屬客戶: r.client_name } : {}),
      物件編號: r.listing_id,
      地段: r.subarea,
      地址備注: r.address_note,
      類型: r.property_type,
      售價萬: r.price_wan,
      底價萬: r.reserve_price_wan,
      建坪: r.build_ping,
      地坪: r.land_ping,
      格局: `${r.rooms}房${r.halls}廳${r.baths}衛`,
      樓層: r.floor_num ? `${r.floor_num}/${r.total_floors}F` : '',
      車位: r.parking,
      委託類型: r.commission_type,
      委託起: r.contract_start_date,
      委託迄: r.contract_end_date,
      現況: r.status_now,
      主要賣點: r.main_point,
      次要賣點: r.second_point,
      目標買方: r.target_buyer,
      私人備注: r.notes_private,
      同業公司: r.colisting_company,
      同業聯絡人: r.colisting_contact,
      FB發文次數: r.fb_post_count,
      建立時間: fmtDate(r.created_at),
    }));
  },

  buyers: async (clientId) => {
    const isAll = clientId === 'ALL';
    const rows = await query(
      `SELECT b.*, c.display_name AS client_name
       FROM buyers b
       LEFT JOIN clients c ON c.client_id = b.client_id
       ${isAll ? '' : 'WHERE b.client_id = $1'}
       ORDER BY b.updated_at DESC`,
      isAll ? [] : [clientId]
    );
    return rows.map((r) => ({
      ...(isAll ? { 所屬客戶: r.client_name } : {}),
      買方編號: r.buyer_no,
      姓名: r.name,
      電話: r.phone,
      Email: r.email,
      LINE: r.line_id,
      來源: r.source,
      狀態: r.status,
      預算下限萬: r.budget_min,
      預算上限萬: r.budget_max,
      偏好類型: r.pref_property_type,
      偏好地區: r.pref_area,
      偏好格局: r.pref_rooms,
      偏好最小坪數: r.pref_min_ping,
      最後聯繫: fmtDate(r.last_contact_at),
      下次跟進日: r.next_follow_up_date,
      備注: r.notes,
      建立時間: fmtDate(r.created_at),
    }));
  },

  showings: async (clientId) => {
    const isAll = clientId === 'ALL';
    const rows = await query(
      `SELECT s.*, b.name AS buyer_name, b.phone AS buyer_phone,
              p.subarea AS property_subarea, p.address_note AS property_address,
              c.display_name AS client_name
       FROM showings s
       LEFT JOIN buyers b ON b.id = s.buyer_id
       LEFT JOIN properties p ON p.id = s.property_id
       LEFT JOIN clients c ON c.client_id = s.client_id
       ${isAll ? '' : 'WHERE s.client_id = $1'}
       ORDER BY s.showing_date DESC`,
      isAll ? [] : [clientId]
    );
    return rows.map((r) => ({
      ...(isAll ? { 所屬客戶: r.client_name } : {}),
      帶看日期: fmtDate(r.showing_date),
      買方姓名: r.buyer_name,
      買方電話: r.buyer_phone,
      物件地段: r.property_subarea,
      物件地址: r.property_address,
      狀態: r.status,
      反應: r.reaction,
      回訪日期: r.follow_up_date,
      已完成回訪: r.follow_up_done ? '是' : '否',
      備注: r.notes,
      建立時間: fmtDate(r.created_at),
    }));
  },

  ai_logs: async (clientId) => {
    const isAll = clientId === 'ALL';
    const rows = await query(
      `SELECT * FROM ai_logs
       ${isAll ? '' : 'WHERE client_id = $1'}
       ORDER BY created_at DESC`,
      isAll ? [] : [clientId]
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
    const clientLabel = targetClient === 'ALL' ? '全部' : targetClient;
    const filename = `TOBE_${table}_${clientLabel}_${now}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (err) {
    console.error('Export error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
