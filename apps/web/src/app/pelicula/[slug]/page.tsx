import { notFound } from 'next/navigation';
import { api, Movie } from '@/lib/api';
import { VideoPlayer } from '@/components/video-player';
import { FavoriteButton } from '@/components/favorite-button';

export default async function MovieDetailPage({ params }: { params: { slug: string } }) {
  const movie = await api.get<Movie>(`/movies/${params.slug}`).catch(() => null);

  if (!movie) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <VideoPlayer src={movie.videoUrl} poster={movie.backdropUrl ?? movie.posterUrl} />

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{movie.title}</h1>
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
            <span key={genre.id} className="rounded-full bg-white/10 px-3 py-1 text-xs">
              {genre.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
