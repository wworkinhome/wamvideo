'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from '@/lib/profile-context';
import { api, ContinueWatchingItem } from '@/lib/api';
import { Row } from './row';
import { ThumbItem } from './thumb-card';

function toThumb(item: ContinueWatchingItem): ThumbItem {
  return {
    id: item.id,
    title: item.title,
    href: item.href,
    image: item.image,
    isPremium: item.isPremium,
    genres: [],
  };
}

export function ContinueWatchingRow() {
  const { user, token, loading: authLoading } = useAuth();
  const { activeProfileId, loading: profileLoading } = useProfile();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    if (authLoading || profileLoading || !user || !activeProfileId) return;
    const query = new URLSearchParams({ profileId: activeProfileId });
    api
      .get<ContinueWatchingItem[]>(`/watch-history/continue-watching?${query.toString()}`, token)
      .then(setItems)
      .catch(() => setItems([]));
  }, [authLoading, profileLoading, user, activeProfileId, token]);

  if (items.length === 0) return null;

  return <Row title="Continuar viendo" items={items.map(toThumb)} />;
}
