'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, Channel } from '@/lib/api';
import { TenantSelectorField } from '@/components/tenant-selector';

export interface ChannelFormValues {
  tenantId: string;
  name: string;
  slug: string;
  category: string;
  logoUrl: string;
  streamUrl: string;
  isPremium: boolean;
}

const EMPTY_VALUES: ChannelFormValues = {
  tenantId: '',
  name: '',
  slug: '',
  category: '',
  logoUrl: '',
  streamUrl: '',
  isPremium: false,
};

export function channelToFormValues(channel: Channel): ChannelFormValues {
  return {
    tenantId: '',
    name: channel.name,
    slug: channel.slug,
    category: channel.category ?? '',
    logoUrl: channel.logoUrl ?? '',
    streamUrl: channel.streamUrl ?? '',
    isPremium: channel.isPremium,
  };
}

const inputClass =
  'w-full rounded-md border border-white/10 bg-surface px-4 py-2.5 text-white outline-none focus:border-white/30';

export function ChannelForm({
  initialValues = EMPTY_VALUES,
  channelId,
}: {
  initialValues?: ChannelFormValues;
  channelId?: string;
}) {
  const { token } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ChannelFormValues>(key: K, value: ChannelFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...(!channelId && values.tenantId ? { tenantId: values.tenantId } : {}),
      name: values.name,
      slug: values.slug,
      category: values.category || undefined,
      logoUrl: values.logoUrl || undefined,
      streamUrl: values.streamUrl,
      isPremium: values.isPremium,
    };

    try {
      if (channelId) {
        await api.patch(`/channels/${channelId}`, payload, token);
      } else {
        await api.post('/channels', payload, token);
      }
      router.push('/admin/canales');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el canal');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl flex-col gap-4">
      {!channelId && <TenantSelectorField value={values.tenantId} onChange={(v) => set('tenantId', v)} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Nombre
          <input required value={values.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Slug
          <input required value={values.slug} onChange={(e) => set('slug', e.target.value)} className={inputClass} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-white/70">
        Categoría
        <input value={values.category} onChange={(e) => set('category', e.target.value)} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-white/70">
        URL del stream (M3U8)
        <input required value={values.streamUrl} onChange={(e) => set('streamUrl', e.target.value)} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-white/70">
        Logo URL
        <input value={values.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} className={inputClass} />
      </label>

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={values.isPremium} onChange={(e) => set('isPremium', e.target.checked)} />
        Canal Premium
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 w-fit rounded-md bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}
