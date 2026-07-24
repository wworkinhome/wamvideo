import { notFound } from 'next/navigation';
import { api, Movie } from '@/lib/api';
import { VideoPlayer } from '@/components/video-player';
import { FavoriteButton } from '@/components/favorite-button';
import { Row } from '@/components/row';
import { ThumbItem } from '@/components/thumb-card';

export default async function MovieDetailPage({ params }: { params: { slug: string } }) {
  const movie = await api.get<Movie>(`/movies/${params.slug}`).catch(() => null);

  if (!movie) {
    notFound();
  }

  const allMovies = await api.get<Movie[]>('/movies').catch(() => [] as Movie[]);
  const related: ThumbItem[] = allMovies
    .filter((m) => m.id !== movie.id)
    .map((m) => ({
      id: m.id,
      title: m.title,
      href: `/pelicula/${m.slug}`,
      image: m.backdropUrl ?? m.posterUrl,
      isPremium: m.isPremium,
      genres: m.genres.map((g) => g.name),
    }));

  return (
    <div className="pb-16 pt-16">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <VideoPlayer src={movie.videoUrl} poster={movie.backdropUrl ?? movie.posterUrl} />

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
