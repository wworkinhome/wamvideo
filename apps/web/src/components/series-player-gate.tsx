'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Series } from '@/lib/api';
import { VideoPlayer } from './video-player';
import { PremiumLock } from './premium-lock';

export function SeriesPlayerGate({
  slug,
  title,
  poster,
  initialVideoUrl,
  initialLocked,
}: {
  slug: string;
  title: string;
  poster: string | null;
  initialVideoUrl: string | null;
  initialLocked: boolean;
}) {
  const { user, token, loading: authLoading } = useAuth();
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [locked, setLocked] = useState(initialLocked);

  useEffect(() => {
    if (authLoading || !user || !locked) return;
    let cancelled = false;

    api
      .get<Series>(`/series/${slug}`, token)
      .then((s) => {
        if (cancelled) return;
        setVideoUrl(s.seasons[0]?.episodes[0]?.videoUrl ?? null);
        setLocked(s.locked ?? false);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, token, slug, locked]);

  if (!videoUrl && !locked) {
    return null;
  }

  return videoUrl ? <VideoPlayer src={videoUrl} poster={poster} /> : <PremiumLock title={title} />;
}
