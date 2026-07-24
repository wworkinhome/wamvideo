'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, Favorite } from '@/lib/api';
import { MovieCard } from '@/components/movie-card';

export default function FavoritosPage() {
  const { user, token, loading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setFetching(false);
      return;
    }
    api
      .get<Favorite[]>('/favorites', token)
      .then(setFavorites)
      .finally(() => setFetching(false));
  }, [user, token, loading]);

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-white/70">
          Inicia sesión para ver tus favoritos.{' '}
          <Link href="/login" className="text-primary">
            Iniciar sesión
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Mis favoritos</h1>
      {fetching && <p className="text-white/50">Cargando…</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {favorites.map((fav) => {
          const item = fav.movie ?? fav.series;
          if (!item) return null;
          const href = fav.movie ? `/pelicula/${item.slug}` : `/serie/${item.slug}`;
          return <MovieCard key={fav.id} item={item} href={href} />;
        })}
      </div>
      {!fetching && favorites.length === 0 && (
        <p className="text-sm text-white/50">Aún no tienes favoritos.</p>
      )}
    </div>
  );
}
