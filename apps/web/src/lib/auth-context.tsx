'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, AuthResponse, AuthUser } from './api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'wamvideo_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthResponse;
        setUser(parsed.user);
        setToken(parsed.accessToken);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persist = (auth: AuthResponse) => {
    setUser(auth.user);
    setToken(auth.accessToken);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  };

  const login = async (email: string, password: string) => {
    const auth = await api.post<AuthResponse>('/auth/login', { email, password });
    persist(auth);
  };

  const register = async (name: string, email: string, password: string) => {
    const auth = await api.post<AuthResponse>('/auth/register', { name, email, password });
    persist(auth);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
