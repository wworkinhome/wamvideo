'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface ImportResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
}

export default function ImportarM3UPage() {
  const { token } = useAuth();
  const [m3u, setM3u] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post<ImportResult>('/channels/import', { m3u }, token);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar la playlist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Importar canales (M3U)</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/60">
        Pega el contenido de una playlist M3U/M3U8 extendida (formato #EXTM3U / #EXTINF, como las de iptv-org). Los
        canales cuyo nombre ya coincida con uno existente se actualizan (stream, logo, categoría) en vez de duplicarse
        — puedes volver a pegar la misma lista para refrescar URLs vencidas.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-2xl flex-col gap-4">
        <textarea
          required
          value={m3u}
          onChange={(e) => setM3u(e.target.value)}
          rows={14}
          placeholder={'#EXTM3U\n#EXTINF:-1 tvg-logo="..." group-title="Noticias",Canal Ejemplo\nhttps://ejemplo.com/stream.m3u8'}
          className="w-full rounded-md border border-white/10 bg-surface px-4 py-3 font-mono text-xs text-white outline-none focus:border-white/30"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-fit rounded-md bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? 'Importando…' : 'Importar'}
        </button>
      </form>

      {result && (
        <div className="mt-6 max-w-md rounded-lg bg-surface p-4 text-sm text-white ring-1 ring-white/10">
          <p>Total leídos: {result.total}</p>
          <p>Creados: {result.created}</p>
          <p>Actualizados: {result.updated}</p>
          <p>Omitidos: {result.skipped}</p>
        </div>
      )}
    </div>
  );
}
