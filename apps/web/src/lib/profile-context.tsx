'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth-context';
import { api, Profile } from './api';

interface ProfileContextValue {
  profiles: Profile[];
  activeProfileId: string | null;
  activeProfile: Profile | null;
  loading: boolean;
  selectProfile: (id: string) => void;
  createProfile: (data: { name: string; isKids?: boolean; pinCode?: string }) => Promise<Profile>;
  updateProfile: (id: string, data: { name?: string; isKids?: boolean }) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);
const STORAGE_KEY = 'wamvideo_active_profile';

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, token, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || !token) {
      setProfiles([]);
      setActiveProfileId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await api.get<Profile[]>('/profiles', token);
      setProfiles(list);
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const nextId = stored && list.some((p) => p.id === stored) ? stored : (list[0]?.id ?? null);
      setActiveProfileId(nextId);
      if (nextId) {
        window.localStorage.setItem(STORAGE_KEY, nextId);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      setProfiles([]);
      setActiveProfileId(null);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, token]);

  const selectProfile = (id: string) => {
    setActiveProfileId(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  };

  const createProfile = async (data: { name: string; isKids?: boolean; pinCode?: string }) => {
    const profile = await api.post<Profile>('/profiles', data, token);
    await refresh();
    return profile;
  };

  const updateProfile = async (id: string, data: { name?: string; isKids?: boolean }) => {
    await api.patch(`/profiles/${id}`, data, token);
    await refresh();
  };

  const deleteProfile = async (id: string) => {
    await api.delete(`/profiles/${id}`, token);
    if (activeProfileId === id) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    await refresh();
  };

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) ?? null,
    [profiles, activeProfileId],
  );

  const value = useMemo(
    () => ({
      profiles,
      activeProfileId,
      activeProfile,
      loading,
      selectProfile,
      createProfile,
      updateProfile,
      deleteProfile,
      refresh,
    }),
    [profiles, activeProfileId, activeProfile, loading, refresh],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile debe usarse dentro de ProfileProvider');
  }
  return ctx;
}
