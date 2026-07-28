'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, Channel, Paginated } from '@/lib/api';

export default function AdminCanalesPage() {
  const { token } = useAuth();
  const [result, setResult] = useState<Paginated<Channel>>({ data: [], total: 0, page: 1, limit: 24 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), limit: '24' });
    if (search) query.set('q', search);
    api
      .get<Paginated<Channel>>(`/channels?${query.toString()}`)
      .then(setResult)
      .catch(() => setResult({ data: [], total: 0, page: 1, limit: 24 }))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, search]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(q);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este canal?')) return;
    await api.delete(`/channels/${id}`, token).catch(() => {});
    load();
  };

  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Canales</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/canales/importar"
            className="rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Importar M3U
          </Link>
          <Link
            href="/admin/canales/nuevo"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            + Nuevo canal
          </Link>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex max-w-sm gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar canal…"
          className="flex-1 rounded-md border border-white/10 bg-surface px-4 py-2 text-white outline-none focus:border-white/30"
        />
        <button type="submit" className="rounded-md bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20">
          Buscar
        </button>
      </form>

      {loading ? (
        <p className="mt-6 text-white/50">Cargando…</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg ring-1 ring-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3">Premium</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {result.data.map((channel) => (
                  <tr key={channel.id} className="border-t border-white/5 text-white">
                    <td className="px-4 py-3">{channel.name}</td>
                    <td className="px-4 py-3 text-white/50">{channel.category ?? '—'}</td>
                    <td className="px-4 py-3 text-white/50">{channel.country ?? '—'}</td>
                    <td className="px-4 py-3">{channel.isPremium ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-3 text-white/50">
                      {channel.streamStatus === 'ok' ? '✅' : channel.streamStatus === 'broken' ? '⚠️' : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/canales/${channel.slug}`} className="mr-4 text-white/70 hover:text-white">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(channel.id)} className="text-white/50 hover:text-red-400">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.data.length === 0 && <p className="p-4 text-white/50">Sin resultados.</p>}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-sm text-white/60">
                Página {page} de {totalPages} ({result.total} canales)
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-md border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
