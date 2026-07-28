'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';

export function HomeGate({ marketing, catalog }: { marketing: ReactNode; catalog: ReactNode }) {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <>{catalog}</>;
  }

  return <>{marketing}</>;
}
