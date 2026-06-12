import { useEffect, useRef, useState } from 'react';
import { STORAGE_KEY } from '../data/pdpmData';
import { createDefaultRow } from '../utils/pdpmCalc';
import { apiGetRows, apiSaveRows } from '../services/api';

function readLocalRows(pdpm) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [createDefaultRow(pdpm)];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.rows)) return parsed.rows;
  } catch {
    // Use a blank row when local data is corrupted.
  }
  return [createDefaultRow(pdpm)];
}

function withIds(rows) {
  return rows.map((row) => ({
    id: row.id || crypto.randomUUID(),
    ...row,
  }));
}

export function useD1SyncedRows(pdpm) {
  const [rows, setRows] = useState(() => withIds(readLocalRows(pdpm)));
  const [syncStatus, setSyncStatus] = useState('Loading D1...');
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRemoteRows() {
      try {
        const remoteRows = withIds(await apiGetRows());
        if (cancelled) return;

        if (remoteRows.length > 0) {
          setRows(remoteRows);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ rows: remoteRows }));
          setSyncStatus('Loaded from Cloudflare D1');
        } else {
          setSyncStatus('D1 connected; using local starter data');
        }
      } catch {
        if (!cancelled) setSyncStatus('Offline/local mode - D1 not reachable');
      } finally {
        if (!cancelled) hydratedRef.current = true;
      }
    }

    loadRemoteRows();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ rows }));

    if (!hydratedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        await apiSaveRows(withIds(rows));
        setSyncStatus(`Saved to D1 at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } catch {
        setSyncStatus('Saved locally; D1 sync failed');
      }
    }, 600);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [rows]);

  return { rows, setRows, syncStatus };
}
