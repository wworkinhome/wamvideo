import Image from 'next/image';
import Link from 'next/link';

interface CardItem {
  slug: string;
  title: string;
  posterUrl: string | null;
  isPremium: boolean;
}

export function MovieCard({ item, href }: { item: CardItem; href: string }) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-lg bg-surface transition-transform hover:scale-105"
    >
      <div className="relative aspect-[2/3] w-full bg-white/5">
        {item.posterUrl ? (
          <Image
            src={item.posterUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/40">
            Sin imagen
          </div>
        )}
        {item.isPremium && (
          <span className="absolute right-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-semibold">
            PREMIUM
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-sm font-medium text-white/90">{item.title}</p>
      </div>
    </Link>
  );
}
