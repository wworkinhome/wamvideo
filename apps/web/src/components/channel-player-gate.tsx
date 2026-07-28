'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Channel } from '@/lib/api';
import { VideoPlayer } from './video-player';
import { PremiumLock } from './premium-lock';

export function ChannelPlayerGate({
  slug,
  title,
  initialStreamUrl,
  initialLocked,
}: {
  slug: string;
  title: string;
  initialStreamUrl: string | null;
  initialLocked: boolean;
}) {
  const { user, token, loading: authLoading } = useAuth();
  const [streamUrl, setStreamUrl] = useState(initialStreamUrl);
  const [locked, setLocked] = useState(initialLocked);

  useEffect(() => {
    if (authLoading || !user || !locked) return;
    let cancelled = false;

    api
      .get<Channel>(`/channels/${slug}`, token)
      .then((c) => {
        if (cancelled) return;
        setStreamUrl(c.streamUrl);
        setLocked(c.locked ?? false);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, token, slug, locked]);

  return streamUrl ? <VideoPlayer src={streamUrl} /> : <PremiumLock title={title} />;
}
