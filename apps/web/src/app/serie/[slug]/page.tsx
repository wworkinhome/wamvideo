import { notFound } from 'next/navigation';
import { api, Series } from '@/lib/api';
import { VideoPlayer } from '@/components/video-player';
import { FavoriteButton } from '@/components/favorite-button';

export default async function SeriesDetailPage({ params }: { params: { slug: string } }) {
  const series = await api.get<Series>(`/series/${params.slug}`).catch(() => null);

  if (!series) {
    notFound();
  }

  const firstEpisode = series.seasons[0]?.episodes[0];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {firstEpisode && <VideoPlayer src={firstEpisode.videoUrl} poster={series.backdropUrl} />}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{series.title}</h1>
          <p className="mt-1 text-sm text-white/50">
            {series.seasons.length} temporada(s){series.isPremium ? ' · Premium' : ''}
          </p>
        </div>
        <FavoriteButton seriesId={series.id} />
      </div>

      <p className="mt-4 max-w-2xl text-white/80">{series.synopsis}</p>

      <div className="mt-8 space-y-6">
        {series.seasons.map((season) => (
          <div key={season.id}>
            <h2 className="mb-2 text-lg font-semibold">
              {season.title ?? `Temporada ${season.number}`}
            </h2>
            <ul className="space-y-2">
              {season.episodes.map((episode) => (
                <li
                  key={episode.id}
                  className="flex items-center justify-between rounded-md bg-surface px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
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
  );
}
