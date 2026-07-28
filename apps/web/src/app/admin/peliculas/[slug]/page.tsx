'use client';

import { useEffect, useState } from 'react';
import { api, Movie } from '@/lib/api';
import { MovieForm, movieToFormValues } from '../movie-form';

export default function EditarPeliculaPage({ params }: { params: { slug: string } }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Movie>(`/movies/${params.slug}`)
      .then(setMovie)
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return <p className="text-white/50">Cargando…</p>;
  }

  if (!movie) {
    return <p className="text-white/50">Película no encontrada.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Editar película</h1>
      <MovieForm initialValues={movieToFormValues(movie)} movieId={movie.id} />
    </div>
  );
}
