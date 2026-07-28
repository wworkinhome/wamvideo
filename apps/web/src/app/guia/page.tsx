import Link from 'next/link';
import { api, EpgChannelGuide, Paginated } from '@/lib/api';
import { EpgGrid } from '@/components/epg-grid';
import { CONTENT_CATEGORIES } from '@/lib/content-categories';

function dayStartUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatDayLabel(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${days[date.getUTCDay()]} ${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
}

export default async function GuiaPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; date?: string; page?: string }>;
}) {
  const { category, date, page } = await searchParams;
  const currentPage = Number(page ?? '1') || 1;
  const limit = 40;

  const query = new URLSearchParams({ page: String(currentPage), limit: String(limit) });
  if (category) query.set('category', category);
  if (date) query.set('date', date);

  const result = await api
    .get<Paginated<EpgChannelGuide>>(`/epg?${query.toString()}`)
    .catch(() => ({ data: [] as EpgChannelGuide[], total: 0, page: 1, limit } satisfies Paginated<EpgChannelGuide>));

  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));
  const nowMs = Date.now();
  const selectedDate = date ? new Date(date + 'T00:00:00Z') : new Date(nowMs);
  const dayStart = dayStartUtc(selectedDate);

  const days = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(nowMs);
    d.setUTCDate(d.getUTCDate() + i);
    return d;
  });

  const categoryParam = (extra: Record<string, string>) => {
    const params = new URLSearchParams(extra);
    return params.toString();
  };

  if (result.total === 0 && currentPage === 1 && !category) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 pt-16 text-center text-white/60">
        Aún no hay canales publicados.
      </div>
    );
  }

  return (
    <div className="pb-16 pt-16">
      <div className="flex flex-col gap-3 px-4 pt-4 sm:px-6 md:px-12">
        <h1 className="text-2xl font-bold text-white">Guía de TV</h1>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/guia?${categoryParam(date ? { date } : {})}`}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              !category ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Todos
          </Link>
          {CONTENT_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/guia?${categoryParam({ category: cat, ...(date ? { date } : {}) })}`}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                category === cat ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {days.map((day) => {
            const isToday = day.toDateString() === new Date(nowMs).toDateString();
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const dayStr = day.toISOString().split('T')[0];
            return (
              <Link
                key={dayStr}
                href={`/guia?${categoryParam({ ...(category ? { category } : {}), ...(isToday ? {} : { date: dayStr }) })}`}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isToday ? 'Hoy' : formatDayLabel(day)}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        {result.data.length === 0 ? (
          <p className="px-4 text-white/60 sm:px-6 md:px-12">Todavía no hay canales con estos filtros.</p>
        ) : (
          <EpgGrid guide={result.data} dayStartIso={dayStart.toISOString()} />
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 px-4">
          <Link
            href={`/guia?${categoryParam({
              ...(category ? { category } : {}),
              ...(date ? { date } : {}),
              page: String(Math.max(1, currentPage - 1)),
            })}`}
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
            href={`/guia?${categoryParam({
              ...(category ? { category } : {}),
              ...(date ? { date } : {}),
              page: String(Math.min(totalPages, currentPage + 1)),
            })}`}
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
