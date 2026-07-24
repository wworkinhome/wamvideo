import { api, Movie, Series } from '@/lib/api';
import { MovieCard } from '@/components/movie-card';

export default async function CatalogoPage() {
  const [movies, series] = await Promise.all([
    api.get<Movie[]>('/movies').catch(() => []),
    api.get<Series[]>('/series').catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Catálogo</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-white/80">Películas</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {movies.map((movie) => (
            <MovieCard key={movie.id} item={movie} href={`/pelicula/${movie.slug}`} />
          ))}
          {movies.length === 0 && (
            <p className="text-sm text-white/50">Aún no hay películas publicadas.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white/80">Series</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {series.map((s) => (
            <MovieCard key={s.id} item={s} href={`/serie/${s.slug}`} />
          ))}
          {series.length === 0 && (
            <p className="text-sm text-white/50">Aún no hay series publicadas.</p>
          )}
        </div>
      </section>
    </div>
  );
}
