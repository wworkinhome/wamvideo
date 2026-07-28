import Link from 'next/link';
import { api, Channel, Paginated } from '@/lib/api';
import { ChannelCard } from '@/components/channel-card';
import { CONTENT_CATEGORIES } from '@/lib/content-categories';

export default async function CanalesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; country?: string }>;
}) {
  const { page, category, country } = await searchParams;
  const currentPage = Number(page ?? '1') || 1;

  const query = new URLSearchParams({ page: String(currentPage), limit: '24' });
  if (category) query.set('category', category);
  if (country) query.set('country', country);

  const result = await api
    .get<Paginated<Channel>>(`/channels?${query.toString()}`)
    .catch(() => ({ data: [] as Channel[], total: 0, page: 1, limit: 24 } satisfies Paginated<Channel>));

  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));

  const buildHref = (extra: Record<string, string>) => {
    const params = new URLSearchParams({
      ...(category ? { category } : {}),
      ...(country ? { country } : {}),
      ...extra,
    });
    return `/canales?${params.toString()}`;
  };

  return (
    <div className="min-h-screen px-4 pb-16 pt-24 sm:px-6 md:px-12">
      <h1 className="mb-4 text-2xl font-bold text-white">TV en Vivo</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref({ category: '' })}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            !category ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Todos
        </Link>
        {CONTENT_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={buildHref({ category: cat })}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              category === cat ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {result.data.length === 0 ? (
        <p className="mt-8 text-white/60">
          {category || country ? 'Todavía no hay canales con estos filtros.' : 'Todavía no hay canales configurados.'}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {result.data.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href={buildHref({ page: String(Math.max(1, currentPage - 1)) })}
            className={`rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 ${
              currentPage <= 1 ? 'pointer-events-none opacity-40' : ''
            }`}
          >
            Anterior
          </Link>
          <span className="text-sm text-white/60">
            Página {currentPage} de {totalPages}
          </span>
          <Link
            href={buildHref({ page: String(Math.min(totalPages, currentPage + 1)) })}
            className={`rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 ${
              currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''
            }`}
          >
            Siguiente
          </Link>
        </div>
      )}
    </div>
  );
}
