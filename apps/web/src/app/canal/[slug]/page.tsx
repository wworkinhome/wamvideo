import { notFound } from 'next/navigation';
import { api, Channel } from '@/lib/api';
import { ChannelPlayerGate } from '@/components/channel-player-gate';

function isLive(startsAt: string, endsAt: string): boolean {
  const now = new Date();
  return new Date(startsAt) <= now && now < new Date(endsAt);
}

function formatTimeRange(startsAt: string, endsAt: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  const start = new Date(startsAt).toLocaleTimeString('es-MX', opts);
  const end = new Date(endsAt).toLocaleTimeString('es-MX', opts);
  return `${start} - ${end}`;
}

export default async function ChannelPage({ params }: { params: { slug: string } }) {
  const channel = await api.get<Channel>(`/channels/${params.slug}`).catch(() => null);

  if (!channel) {
    notFound();
  }

  return (
    <div className="pb-16 pt-16">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <ChannelPlayerGate
          slug={channel.slug}
          title={channel.name}
          initialStreamUrl={channel.streamUrl}
          initialLocked={channel.locked ?? false}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{channel.name}</h1>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
            {channel.category}
          </span>
          {channel.isPremium && (
            <span className="rounded bg-primary px-2 py-1 text-xs font-bold text-white">PREMIUM</span>
          )}
        </div>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-white">Programación de hoy</h2>
        <ul className="space-y-2">
          {(channel.epgPrograms ?? []).map((program) => {
            const live = isLive(program.startsAt, program.endsAt);
            return (
              <li
                key={program.id}
                className={`flex items-center justify-between rounded-md px-4 py-3 ${
                  live ? 'bg-primary/15 ring-1 ring-primary/40' : 'bg-surface'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {live && (
                      <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                        LIVE
                      </span>
                    )}
                    <p className="font-medium text-white">{program.title}</p>
                  </div>
                  {program.description && (
                    <p className="text-sm text-white/50">{program.description}</p>
                  )}
                </div>
                <span className="whitespace-nowrap text-sm text-white/40">
                  {formatTimeRange(program.startsAt, program.endsAt)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
