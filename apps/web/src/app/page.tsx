import Link from 'next/link';
import { api, Movie, Series } from '@/lib/api';
import { Hero, HeroItem } from '@/components/hero';
import { Row } from '@/components/row';
import { HomeGate } from '@/components/home-gate';
import { toThumb, buildGenreRows } from '@/lib/catalog';

export default async function HomePage() {
  const [movies, series] = await Promise.all([
    api.get<Movie[]>('/movies').catch(() => [] as Movie[]),
    api.get<Series[]>('/series').catch(() => [] as Series[]),
  ]);

  const featured = movies.find((m) => m.isPremium) ?? movies[0] ?? series[0];
  const featuredKind: 'movie' | 'series' = featured && 'videoUrl' in featured ? 'movie' : 'series';

  const heroItem: HeroItem = featured
    ? {
        id: featured.id,
        title: featured.title,
        synopsis: featured.synopsis,
        image: featured.backdropUrl ?? featured.posterUrl,
        isPremium: featured.isPremium,
        href: featuredKind === 'movie' ? `/pelicula/${featured.slug}` : `/serie/${featured.slug}`,
        genres: featured.genres.map((g) => g.name),
      }
    : {
        id: 'wamvideo-default',
        title: 'Todo tu entretenimiento en WAMVIDEO',
        synopsis:
          'Streaming bajo demanda, TV en vivo, eventos y guía de programación en una sola plataforma.',
        image: null,
        isPremium: false,
        href: '/catalogo',
      };

  const marketing = (
    <div>
      <Hero item={heroItem} />

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-16 md:grid-cols-3">
        {[
          { title: 'VOD ilimitado', desc: 'Miles de películas y series bajo demanda.' },
          { title: 'TV en vivo', desc: 'Canales en vivo con EPG y catch-up (próximamente).' },
          { title: 'Multiplataforma', desc: 'Web, móvil y pronto Smart TV.' },
        ].map((feature) => (
          <div key={feature.title} className="rounded-lg bg-surface p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
            <p className="text-sm text-white/60">{feature.desc}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
        <h2 className="text-2xl font-bold text-white">
          Empieza a ver hoy. Cancela cuando quieras.
        </h2>
        <p className="mt-3 text-white/60">
          Explora nuestro catálogo de películas y series originales.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-block rounded-md bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary/90"
        >
          Explorar catálogo
        </Link>
      </section>
    </div>
  );

  const movieThumbs = movies.map((m) => toThumb('movie', m));
  const seriesThumbs = series.map((s) => toThumb('series', s));
  const recentThumbs = [...movieThumbs, ...seriesThumbs].slice(0, 20);
  const genreMap = buildGenreRows(movies, series);

  const catalog = (
    <div className="pb-16">
      <Hero item={heroItem} />
      <div className="-mt-16 sm:-mt-24">
        <Row title="Recién agregado" items={recentThumbs} />
        <Row title="Películas" items={movieThumbs} />
        <Row title="Series" items={seriesThumbs} />
        {Array.from(genreMap.entries()).map(([genre, items]) => (
          <Row key={genre} title={genre} items={items} />
        ))}
      </div>
    </div>
  );

  return <HomeGate marketing={marketing} catalog={catalog} />;
}
