'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, Movie } from '@/lib/api';

export default function AdminPeliculasPage() {
  const { token } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api
      .get<Movie[]>('/movies')
      .then(setMovies)
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta película?')) return;
    await api.delete(`/movies/${id}`, token).catch(() => {});
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Películas</h1>
        <Link
          href="/admin/peliculas/nueva"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          + Nueva película
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
                <th className="px-4 py-3">Géneros</th>
                <th className="px-4 py-3">Premium</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id} className="border-t border-white/5 text-white">
                  <td className="px-4 py-3">{movie.title}</td>
                  <td className="px-4 py-3 text-white/50">{movie.slug}</td>
                  <td className="px-4 py-3 text-white/50">{movie.genres.map((g) => g.name).join(', ')}</td>
                  <td className="px-4 py-3">{movie.isPremium ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/peliculas/${movie.slug}`} className="mr-4 text-white/70 hover:text-white">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(movie.id)} className="text-white/50 hover:text-red-400">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {movies.length === 0 && <p className="p-4 text-white/50">Aún no hay películas.</p>}
        </div>
      )}
    </div>
  );
}
