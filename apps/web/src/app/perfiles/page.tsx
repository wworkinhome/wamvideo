'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from '@/lib/profile-context';
import { Profile } from '@/lib/api';
import { gradientCss } from '@/lib/visuals';

function ProfileTile({
  profile,
  managing,
  onSelect,
  onEdit,
  onDelete,
}: {
  profile: Profile;
  managing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={managing ? onEdit : onSelect}
        className="group relative h-24 w-24 overflow-hidden rounded-lg ring-2 ring-transparent transition hover:ring-white sm:h-28 sm:w-28"
        style={{ backgroundImage: gradientCss(profile.id) }}
      >
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">
          {profile.name.charAt(0).toUpperCase()}
        </span>
        {profile.isKids && (
          <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
            KIDS
          </span>
        )}
        {managing && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
            Editar
          </span>
        )}
      </button>
      <p className="text-sm text-white/80">{profile.name}</p>
      {managing && (
        <button onClick={onDelete} className="text-xs text-white/40 hover:text-red-400">
          Eliminar
        </button>
      )}
    </div>
  );
}

export default function PerfilesPage() {
  const { user, loading: authLoading } = useAuth();
  const { profiles, loading, selectProfile, createProfile, updateProfile, deleteProfile } = useProfile();
  const router = useRouter();
  const [managing, setManaging] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [isKids, setIsKids] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-white/60">
        Inicia sesión para gestionar tus perfiles.
      </div>
    );
  }

  const handleSelect = (id: string) => {
    selectProfile(id);
    router.push('/');
  };

  const openCreate = () => {
    setEditing(null);
    setName('');
    setIsKids(false);
    setCreating(true);
    setError(null);
  };

  const openEdit = (profile: Profile) => {
    setEditing(profile);
    setName(profile.name);
    setIsKids(profile.isKids);
    setCreating(true);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateProfile(editing.id, { name, isKids });
      } else {
        await createProfile({ name, isKids });
      }
      setCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este perfil? Se perderán sus favoritos e historial.')) return;
    await deleteProfile(id);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20">
      <h1 className="mb-10 text-3xl font-bold text-white sm:text-4xl">¿Quién está viendo?</h1>

      {loading ? (
        <p className="text-white/50">Cargando…</p>
      ) : creating ? (
        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
          <h2 className="text-lg font-semibold text-white">{editing ? 'Editar perfil' : 'Nuevo perfil'}</h2>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            className="rounded-md border border-white/10 bg-surface px-4 py-2.5 text-white outline-none focus:border-white/30"
          />
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={isKids} onChange={(e) => setIsKids(e.target.checked)} />
            Perfil infantil
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-md border border-white/20 px-6 py-2.5 font-semibold text-white transition hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-6">
            {profiles.map((profile) => (
              <ProfileTile
                key={profile.id}
                profile={profile}
                managing={managing}
                onSelect={() => handleSelect(profile.id)}
                onEdit={() => openEdit(profile)}
                onDelete={() => handleDelete(profile.id)}
              />
            ))}
            <button
              type="button"
              onClick={openCreate}
              className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-white/20 text-white/50 transition hover:border-white/40 hover:text-white sm:h-28 sm:w-28"
            >
              <span className="text-2xl">+</span>
              <span className="text-xs">Agregar</span>
            </button>
          </div>

          <button
            onClick={() => setManaging((m) => !m)}
            className="mt-10 rounded-md border border-white/20 px-6 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
          >
            {managing ? 'Listo' : 'Administrar perfiles'}
          </button>

          <Link href="/" className="mt-4 text-sm text-white/40 hover:text-white/70">
            Volver al inicio
          </Link>
        </>
      )}
    </div>
  );
}
