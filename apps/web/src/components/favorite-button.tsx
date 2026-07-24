'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

export function FavoriteButton({ movieId, seriesId }: { movieId?: string; seriesId?: string }) {
  const { token, user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  if (!user) {
    return null;
  }

  const handleClick = async () => {
    setStatus('saving');
    try {
      await api.post('/favorites', { movieId, seriesId }, token);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={status === 'saving' || status === 'saved'}
      className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:opacity-60"
    >
      {status === 'saved' ? 'En favoritos ✓' : 'Agregar a favoritos'}
    </button>
  );
}
