import { Movie, Series } from '@/lib/api';
import { ThumbItem } from '@/components/thumb-card';

export function toThumb(kind: 'movie' | 'series', item: Movie | Series): ThumbItem {
  return {
    id: item.id,
    title: item.title,
    href: kind === 'movie' ? `/pelicula/${item.slug}` : `/serie/${item.slug}`,
    image: item.backdropUrl ?? item.posterUrl,
    isPremium: item.isPremium,
    genres: item.genres.map((g) => g.name),
  };
}

export function buildGenreRows(movies: Movie[], series: Series[]): Map<string, ThumbItem[]> {
  const genreMap = new Map<string, ThumbItem[]>();
  for (const [kind, list] of [
    ['movie', movies],
    ['series', series],
  ] as const) {
    for (const item of list) {
      for (const genre of item.genres) {
        const bucket = genreMap.get(genre.name) ?? [];
        bucket.push(toThumb(kind, item));
        genreMap.set(genre.name, bucket);
      }
    }
  }
  return genreMap;
}
