import Link from 'next/link';
import { api, Movie } from '@/lib/api';
import { Hero, HeroItem } from '@/components/hero';

export default async function LandingPage() {
  const movies = await api.get<Movie[]>('/movies').catch(() => [] as Movie[]);
  const featured = movies.find((m) => m.isPremium) ?? movies[0];

  const heroItem: HeroItem = featured
    ? {
        id: featured.id,
        title: featured.title,
        synopsis: featured.synopsis,
        image: featured.backdropUrl ?? featured.posterUrl,
        isPremium: featured.isPremium,
        href: `/pelicula/${featured.slug}`,
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

  return (
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
}
