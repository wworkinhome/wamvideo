'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { api, Movie } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { VideoPlayer } from '@/components/video-player';
import { PremiumLock } from '@/components/premium-lock';
import { FavoriteButton } from '@/components/favorite-button';
import { Row } from '@/components/row';
import { ThumbItem } from '@/components/thumb-card';

export default function MovieDetailPage({ params }: { params: { slug: string } }) {
  const { token, loading: authLoading } = useAuth();
  const [movie, setMovie] = useState<Movie | null | undefined>(undefined);
  const [related, setRelated] = useState<ThumbItem[]>([]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    api
      .get<Movie>(`/movies/${params.slug}`, token)
      .then((m) => {
        if (!cancelled) setMovie(m);
      })
      .catch(() => {
        if (!cancelled) setMovie(null);
      });

    api
      .get<Movie[]>('/movies', token)
      .then((all) => {
        if (cancelled) return;
        setRelated(
          all
            .filter((m) => m.slug !== params.slug)
            .map((m) => ({
              id: m.id,
              title: m.title,
              href: `/pelicula/${m.slug}`,
              image: m.backdropUrl ?? m.posterUrl,
              isPremium: m.isPremium,
              genres: m.genres.map((g) => g.name),
            })),
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [params.slug, token, authLoading]);

  if (movie === undefined) {
    return <div className="pt-24 text-center text-white/50">Cargando…</div>;
  }

  if (movie === null) {
    notFound();
  }

  return (
    <div className="pb-16 pt-16">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        {movie.videoUrl ? (
          <VideoPlayer src={movie.videoUrl} poster={movie.backdropUrl ?? movie.posterUrl} />
        ) : (
          <PremiumLock title={movie.title} />
        )}

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{movie.title}</h1>
            <p className="mt-1 text-sm text-white/50">
              {movie.releaseYear ?? '—'} · {movie.durationMinutes ?? '—'} min
              {movie.isPremium ? ' · Premium' : ''}
            </p>
          </div>
          <FavoriteButton movieId={movie.id} />
        </div>

        <p className="mt-4 max-w-2xl text-white/80">{movie.synopsis}</p>

        {movie.genres.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span key={genre.id} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                {genre.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <Row title="Más como esta" items={related} />
      </div>
    </div>
  );
}
