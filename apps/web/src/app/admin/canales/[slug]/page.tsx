'use client';

import { useEffect, useState } from 'react';
import { api, Channel } from '@/lib/api';
import { ChannelForm, channelToFormValues } from '../channel-form';

export default function EditarCanalPage({ params }: { params: { slug: string } }) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Channel>(`/channels/${params.slug}`)
      .then(setChannel)
      .catch(() => setChannel(null))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return <p className="text-white/50">Cargando…</p>;
  }

  if (!channel) {
    return <p className="text-white/50">Canal no encontrado.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Editar canal</h1>
      <ChannelForm initialValues={channelToFormValues(channel)} channelId={channel.id} />
    </div>
  );
}
