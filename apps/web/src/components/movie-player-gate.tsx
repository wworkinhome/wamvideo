'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Movie } from '@/lib/api';
import { VideoPlayer } from './video-player';
import { PremiumLock } from './premium-lock';

export function MoviePlayerGate({
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
      .get<Movie>(`/movies/${slug}`, token)
      .then((m) => {
        if (cancelled) return;
        setVideoUrl(m.videoUrl);
        setLocked(m.locked ?? false);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, token, slug, locked]);

  return videoUrl ? <VideoPlayer src={videoUrl} poster={poster} /> : <PremiumLock title={title} />;
}
