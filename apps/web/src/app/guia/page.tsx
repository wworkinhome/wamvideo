import { api, Channel } from '@/lib/api';
import { EpgGrid } from '@/components/epg-grid';

export default async function GuiaPage() {
  const channels = await api.get<Channel[]>('/channels').catch(() => [] as Channel[]);

  if (channels.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-white/60">
        Aún no hay canales publicados.
      </div>
    );
  }

  return (
    <div className="pb-16 pt-16">
      <EpgGrid channels={channels} />
    </div>
  );
}
