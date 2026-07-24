import Image from 'next/image';
import Link from 'next/link';
import { gradientCss } from '@/lib/visuals';

export interface ThumbItem {
  id: string;
  title: string;
  href: string;
  image: string | null;
  isPremium: boolean;
  genres: string[];
}

export function ThumbCard({ item }: { item: ThumbItem }) {
  return (
    <Link
      href={item.href}
      className="group/card relative block w-full overflow-hidden rounded-md bg-surface shadow-lg ring-1 ring-white/5 transition-transform duration-300 ease-out hover:z-20 hover:scale-110 hover:shadow-2xl"
    >
      <div className="relative aspect-video w-full">
        {item.image ? (
          <Image src={item.image} alt={item.title} fill sizes="(max-width: 640px) 42vw, 240px" className="object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center p-3 text-center"
            style={{ backgroundImage: gradientCss(item.id) }}
          >
            <span className="text-sm font-bold leading-tight text-white drop-shadow-md">
              {item.title}
            </span>
          </div>
        )}

        {item.isPremium && (
          <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
            PREMIUM
          </span>
        )}

        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/10 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
          <p className="truncate text-xs font-semibold text-white">{item.title}</p>
          {item.genres.length > 0 && (
            <p className="truncate text-[10px] text-white/60">{item.genres.join(' · ')}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
