import Image from 'next/image';
import Link from 'next/link';
import { gradientCss } from '@/lib/visuals';

export interface HeroItem {
  id: string;
  title: string;
  synopsis: string | null;
  image: string | null;
  isPremium: boolean;
  href: string;
  genres?: string[];
}

export function Hero({ item }: { item: HeroItem }) {
  return (
    <section className="relative flex h-[62vw] max-h-[80vh] min-h-[440px] w-full items-end sm:items-center">
      <div className="absolute inset-0 overflow-hidden">
        {item.image ? (
          <Image src={item.image} alt={item.title} fill priority className="object-cover" />
        ) : (
          <div className="h-full w-full" style={{ backgroundImage: gradientCss(item.id) }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-xl px-4 pb-14 sm:px-6 sm:pb-0 md:px-12">
        {item.isPremium && (
          <span className="mb-3 inline-block rounded bg-primary px-2 py-1 text-xs font-bold tracking-wide text-white">
            PREMIUM
          </span>
        )}
        <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
          {item.title}
        </h1>
        {item.genres && item.genres.length > 0 && (
          <p className="mt-3 text-sm font-medium text-white/70">{item.genres.join(' · ')}</p>
        )}
        {item.synopsis && (
          <p className="mt-4 line-clamp-3 max-w-md text-sm text-white/80 sm:text-base">
            {item.synopsis}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={item.href}
            className="flex items-center gap-2 rounded bg-white px-6 py-2.5 font-bold text-black transition hover:bg-white/85"
          >
            ▶ Reproducir
          </Link>
          <Link
            href={item.href}
            className="flex items-center gap-2 rounded bg-white/20 px-6 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/30"
          >
            ⓘ Más información
          </Link>
        </div>
      </div>
    </section>
  );
}
