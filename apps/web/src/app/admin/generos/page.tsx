'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Genre } from '@/lib/api';

export default function AdminGenerosPage() {
  const { token } = useAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    api
      .get<Genre[]>('/genres')
      .then(setGenres)
      .catch(() => setGenres([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/genres', { name: name.trim() }, token);
      setName('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el género');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este género?')) return;
    await api.delete(`/genres/${id}`, token).catch(() => {});
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Géneros</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del género"
          className="flex-1 rounded-md border border-white/10 bg-surface px-4 py-2 text-white outline-none focus:border-white/30"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
        >
          Agregar
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="mt-6 text-white/50">Cargando…</p>
      ) : (
        <ul className="mt-6 flex max-w-md flex-col gap-2">
          {genres.map((genre) => (
            <li
              key={genre.id}
              className="flex items-center justify-between rounded-md bg-surface px-4 py-2.5 text-white"
            >
              {genre.name}
              <button
                onClick={() => handleDelete(genre.id)}
                className="text-sm text-white/50 transition hover:text-red-400"
              >
                Eliminar
              </button>
            </li>
          ))}
          {genres.length === 0 && <p className="text-white/50">Aún no hay géneros.</p>}
        </ul>
      )}
    </div>
  );
}
