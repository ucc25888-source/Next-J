import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (!_client) {
    let url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
    }
    // Strip any path suffix so supabase-js gets the bare project URL
    url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    _client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

function inlineParams(sql: string, params: unknown[]): string {
  let result = sql;
  for (let i = params.length; i >= 1; i--) {
    const val = params[i - 1];
    let sqlVal: string;
    if (val === null || val === undefined) {
      sqlVal = 'NULL';
    } else if (typeof val === 'string') {
      sqlVal = `'${val.replace(/'/g, "''")}'`;
    } else if (typeof val === 'boolean') {
      sqlVal = val ? 'true' : 'false';
    } else {
      sqlVal = String(val);
    }
    result = result.replace(new RegExp(`\\$${i}(?!\\d)`, 'g'), sqlVal);
  }
  return result;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const sb = getClient();
  const finalSql = (params && params.length > 0 ? inlineParams(sql, params) : sql).trim();

  const { data, error } = await sb.rpc('exec_sql', { query_text: finalSql });

  if (error) {
    console.error('DB query error:', error.message, '\nSQL:', finalSql.slice(0, 300));
    throw new Error(`DB query failed: ${error.message}`);
  }

  if (!data) return [] as T[];
  if (Array.isArray(data)) return data as T[];
  return [] as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
