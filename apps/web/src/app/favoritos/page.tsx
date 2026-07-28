'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, Favorite } from '@/lib/api';
import { ThumbCard, ThumbItem } from '@/components/thumb-card';

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
      .catch(() => setFavorites([]))
      .finally(() => setFetching(false));
  }, [user, token, loading]);

  if (!loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-white/70">
          Inicia sesión para ver tu lista.{' '}
          <Link href="/login" className="font-medium text-white hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    );
  }

  const items: ThumbItem[] = favorites
    .map((fav) => {
      const entity = fav.movie ?? fav.series;
      if (!entity) return null;
      return {
        id: fav.id,
        title: entity.title,
        href: fav.movie ? `/pelicula/${entity.slug}` : `/serie/${entity.slug}`,
        image: entity.backdropUrl ?? entity.posterUrl,
        isPremium: entity.isPremium,
        genres: entity.genres.map((g) => g.name),
      };
    })
    .filter((x): x is ThumbItem => x !== null);

  return (
    <div className="min-h-screen px-4 pb-16 pt-24 sm:px-6 md:px-12">
      <h1 className="mb-6 text-2xl font-bold text-white">Mi lista</h1>
      {fetching && <p className="text-white/50">Cargando…</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <ThumbCard key={item.id} item={item} />
        ))}
      </div>
      {!fetching && items.length === 0 && (
        <p className="text-sm text-white/50">Aún no tienes nada en tu lista.</p>
      )}
    </div>
  );
}
