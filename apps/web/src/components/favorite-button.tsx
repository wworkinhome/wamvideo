'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from '@/lib/profile-context';
import { api } from '@/lib/api';

export function FavoriteButton({ movieId, seriesId }: { movieId?: string; seriesId?: string }) {
  const { token, user } = useAuth();
  const { activeProfileId } = useProfile();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  if (!user) {
    return null;
  }

  const handleClick = async () => {
    setStatus('saving');
    const query = activeProfileId ? `?profileId=${activeProfileId}` : '';
    try {
      await api.post(`/favorites${query}`, { movieId, seriesId }, token);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={status === 'saving' || status === 'saved'}
      className="flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-60"
    >
      {status === 'saved' ? '✓ En mi lista' : '+ Mi lista'}
    </button>
  );
}
