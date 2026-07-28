'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, Series } from '@/lib/api';

export default function AdminSeriesPage() {
  const { token } = useAuth();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api
      .get<Series[]>('/series')
      .then(setSeries)
      .catch(() => setSeries([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta serie?')) return;
    await api.delete(`/series/${id}`, token).catch(() => {});
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Series</h1>
        <Link
          href="/admin/series/nueva"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          + Nueva serie
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-white/50">Cargando…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg ring-1 ring-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Temporadas</th>
                <th className="px-4 py-3">Géneros</th>
                <th className="px-4 py-3">Premium</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {series.map((item) => (
                <tr key={item.id} className="border-t border-white/5 text-white">
                  <td className="px-4 py-3">{item.title}</td>
                  <td className="px-4 py-3 text-white/50">{item.slug}</td>
                  <td className="px-4 py-3 text-white/50">{item.seasons?.length ?? 0}</td>
                  <td className="px-4 py-3 text-white/50">{item.genres.map((g) => g.name).join(', ')}</td>
                  <td className="px-4 py-3">{item.isPremium ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/series/${item.slug}`} className="mr-4 text-white/70 hover:text-white">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(item.id)} className="text-white/50 hover:text-red-400">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {series.length === 0 && <p className="p-4 text-white/50">Aún no hay series.</p>}
        </div>
      )}

      <p className="mt-4 text-xs text-white/40">
        La gestión de temporadas y episodios todavía no tiene interfaz — se administra directamente en la base de datos por ahora.
      </p>
    </div>
  );
}
