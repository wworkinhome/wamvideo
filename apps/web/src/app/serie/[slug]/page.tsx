'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { api, Series } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { VideoPlayer } from '@/components/video-player';
import { PremiumLock } from '@/components/premium-lock';
import { FavoriteButton } from '@/components/favorite-button';
import { Row } from '@/components/row';
import { ThumbItem } from '@/components/thumb-card';

export default function SeriesDetailPage({ params }: { params: { slug: string } }) {
  const { token, loading: authLoading } = useAuth();
  const [series, setSeries] = useState<Series | null | undefined>(undefined);
  const [related, setRelated] = useState<ThumbItem[]>([]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    api
      .get<Series>(`/series/${params.slug}`, token)
      .then((s) => {
        if (!cancelled) setSeries(s);
      })
      .catch(() => {
        if (!cancelled) setSeries(null);
      });

    api
      .get<Series[]>('/series', token)
      .then((all) => {
        if (cancelled) return;
        setRelated(
          all
            .filter((s) => s.slug !== params.slug)
            .map((s) => ({
              id: s.id,
              title: s.title,
              href: `/serie/${s.slug}`,
              image: s.backdropUrl ?? s.posterUrl,
              isPremium: s.isPremium,
              genres: s.genres.map((g) => g.name),
            })),
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [params.slug, token, authLoading]);

  if (series === undefined) {
    return <div className="pt-24 text-center text-white/50">Cargando…</div>;
  }

  if (series === null) {
    notFound();
  }

  const firstEpisode = series.seasons[0]?.episodes[0];

  return (
    <div className="pb-16 pt-16">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        {firstEpisode?.videoUrl ? (
          <VideoPlayer src={firstEpisode.videoUrl} poster={series.backdropUrl} />
        ) : (
          <PremiumLock title={series.title} />
        )}

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{series.title}</h1>
            <p className="mt-1 text-sm text-white/50">
              {series.seasons.length} temporada(s){series.isPremium ? ' · Premium' : ''}
            </p>
          </div>
          <FavoriteButton seriesId={series.id} />
        </div>

        <p className="mt-4 max-w-2xl text-white/80">{series.synopsis}</p>

        {series.genres.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {series.genres.map((genre) => (
              <span key={genre.id} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                {genre.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {series.seasons.map((season) => (
            <div key={season.id}>
              <h2 className="mb-2 text-lg font-semibold text-white">
                {season.title ?? `Temporada ${season.number}`}
              </h2>
              <ul className="space-y-2">
                {season.episodes.map((episode) => (
                  <li
                    key={episode.id}
                    className="flex items-center justify-between rounded-md bg-surface px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {episode.number}. {episode.title}
                      </p>
                      <p className="text-sm text-white/50">{episode.synopsis}</p>
                    </div>
                    <span className="text-sm text-white/40">
                      {episode.durationMinutes ?? '—'} min
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <Row title="Más series" items={related} />
      </div>
    </div>
  );
}
