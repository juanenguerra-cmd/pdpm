export async function apiGetRows() {
  const response = await fetch('/api/residents', {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) throw new Error(`Load failed: ${response.status}`);
  const payload = await response.json();
  return Array.isArray(payload.rows) ? payload.rows : [];
}

export async function apiSaveRows(rows) {
  const response = await fetch('/api/residents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ rows }),
  });

  if (!response.ok) throw new Error(`Save failed: ${response.status}`);
  return response.json();
}
