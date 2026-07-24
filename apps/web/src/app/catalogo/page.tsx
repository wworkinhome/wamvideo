import { api, Movie, Series } from '@/lib/api';
import { Hero, HeroItem } from '@/components/hero';
import { Row } from '@/components/row';
import { ThumbItem } from '@/components/thumb-card';

function toThumb(kind: 'movie' | 'series', item: Movie | Series): ThumbItem {
  return {
    id: item.id,
    title: item.title,
    href: kind === 'movie' ? `/pelicula/${item.slug}` : `/serie/${item.slug}`,
    image: item.backdropUrl ?? item.posterUrl,
    isPremium: item.isPremium,
    genres: item.genres.map((g) => g.name),
  };
}

export default async function CatalogoPage() {
  const [movies, series] = await Promise.all([
    api.get<Movie[]>('/movies').catch(() => [] as Movie[]),
    api.get<Series[]>('/series').catch(() => [] as Series[]),
  ]);

  const movieThumbs = movies.map((m) => toThumb('movie', m));
  const seriesThumbs = series.map((s) => toThumb('series', s));
  const allThumbs = [...movieThumbs, ...seriesThumbs];

  const featured = movies.find((m) => m.isPremium) ?? movies[0] ?? series[0];
  const featuredKind: 'movie' | 'series' = featured && 'videoUrl' in featured ? 'movie' : 'series';

  const heroItem: HeroItem | null = featured
    ? {
        id: featured.id,
        title: featured.title,
        synopsis: featured.synopsis,
        image: featured.backdropUrl ?? featured.posterUrl,
        isPremium: featured.isPremium,
        href: featuredKind === 'movie' ? `/pelicula/${featured.slug}` : `/serie/${featured.slug}`,
        genres: featured.genres.map((g) => g.name),
      }
    : null;

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

  return (
    <div className="pb-16">
      {heroItem ? (
        <Hero item={heroItem} />
      ) : (
        <div className="pt-28 text-center text-white/60">Aún no hay contenido publicado.</div>
      )}

      <div className={heroItem ? '-mt-16 sm:-mt-24' : 'pt-8'}>
        <Row title="Populares en WAMVIDEO" items={allThumbs} />
        <Row title="Películas" items={movieThumbs} />
        <Row title="Series" items={seriesThumbs} />
        {Array.from(genreMap.entries()).map(([genre, items]) => (
          <Row key={genre} title={genre} items={items} />
        ))}
      </div>
    </div>
  );
}
