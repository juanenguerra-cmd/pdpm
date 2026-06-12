export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

type ResidentRow = Record<string, unknown> & { id?: string };

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(init.headers || {}),
    },
  });

const getId = () => crypto.randomUUID();

function normalizeRow(row: ResidentRow, index = 0) {
  return {
    ...row,
    id: typeof row.id === 'string' && row.id.trim() ? row.id : getId(),
    position: Number.isFinite(Number(row.position)) ? Number(row.position) : index,
  };
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Response('Invalid JSON body', { status: 400 });
  }
}

async function listResidents(env: Env) {
  const result = await env.DB.prepare(
    `SELECT id, position, data, created_at, updated_at
     FROM resident_rows
     ORDER BY position ASC, updated_at ASC`,
  ).all<{ id: string; position: number; data: string; created_at: string; updated_at: string }>();

  const rows = (result.results || []).map((record) => {
    const parsed = JSON.parse(record.data || '{}');
    return {
      id: record.id,
      ...parsed,
      position: record.position,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  });

  return json({ rows });
}

async function replaceResidents(request: Request, env: Env) {
  const payload = await readJson<{ rows?: ResidentRow[] }>(request);
  if (!Array.isArray(payload.rows)) return json({ error: 'Expected rows array' }, { status: 400 });

  const normalized = payload.rows.map(normalizeRow);
  const statements = [env.DB.prepare('DELETE FROM resident_rows')];

  for (const row of normalized) {
    const { id, position, createdAt, updatedAt, ...data } = row as ResidentRow & { id: string; position: number };
    statements.push(
      env.DB.prepare(
        `INSERT INTO resident_rows (id, position, data, updated_at)
         VALUES (?, ?, ?, datetime('now'))`,
      ).bind(id, position, JSON.stringify(data)),
    );
  }

  await env.DB.batch(statements);
  return json({ ok: true, count: normalized.length, rows: normalized });
}

async function upsertResident(request: Request, env: Env) {
  const payload = await readJson<{ row?: ResidentRow }>(request);
  if (!payload.row || typeof payload.row !== 'object') return json({ error: 'Expected row object' }, { status: 400 });

  const row = normalizeRow(payload.row);
  const { id, position, createdAt, updatedAt, ...data } = row as ResidentRow & { id: string; position: number };

  await env.DB.prepare(
    `INSERT INTO resident_rows (id, position, data, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       position = excluded.position,
       data = excluded.data,
       updated_at = datetime('now')`,
  ).bind(id, position, JSON.stringify(data)).run();

  return json({ ok: true, row });
}

async function deleteResident(id: string, env: Env) {
  await env.DB.prepare('DELETE FROM resident_rows WHERE id = ?').bind(id).run();
  return json({ ok: true });
}

async function handleApi(request: Request, env: Env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (request.method === 'GET' && pathname === '/api/health') {
    return json({ ok: true, service: 'pdpm-ltc-tracker', storage: 'cloudflare-d1' });
  }

  if (request.method === 'GET' && pathname === '/api/residents') return listResidents(env);
  if (request.method === 'POST' && pathname === '/api/residents') return replaceResidents(request, env);
  if (request.method === 'POST' && pathname === '/api/resident') return upsertResident(request, env);

  const deleteMatch = pathname.match(/^\/api\/resident\/([^/]+)$/);
  if (request.method === 'DELETE' && deleteMatch) return deleteResident(decodeURIComponent(deleteMatch[1]), env);

  return json({ error: 'Not found' }, { status: 404 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env);
      } catch (error) {
        if (error instanceof Response) return error;
        return json({ error: 'Server error' }, { status: 500 });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
