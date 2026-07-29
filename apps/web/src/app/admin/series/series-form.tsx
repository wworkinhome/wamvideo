'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, Genre, Series } from '@/lib/api';
import { TenantSelectorField } from '@/components/tenant-selector';

export interface SeriesFormValues {
  tenantId: string;
  title: string;
  slug: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  isPremium: boolean;
  genreIds: string[];
}

const EMPTY_VALUES: SeriesFormValues = {
  tenantId: '',
  title: '',
  slug: '',
  synopsis: '',
  posterUrl: '',
  backdropUrl: '',
  isPremium: false,
  genreIds: [],
};

export function seriesToFormValues(series: Series): SeriesFormValues {
  return {
    tenantId: '',
    title: series.title,
    slug: series.slug,
    synopsis: series.synopsis ?? '',
    posterUrl: series.posterUrl ?? '',
    backdropUrl: series.backdropUrl ?? '',
    isPremium: series.isPremium,
    genreIds: series.genres.map((g) => g.id),
  };
}

const inputClass =
  'w-full rounded-md border border-white/10 bg-surface px-4 py-2.5 text-white outline-none focus:border-white/30';

export function SeriesForm({
  initialValues = EMPTY_VALUES,
  seriesId,
}: {
  initialValues?: SeriesFormValues;
  seriesId?: string;
}) {
  const { token } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Genre[]>('/genres')
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  const set = <K extends keyof SeriesFormValues>(key: K, value: SeriesFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const toggleGenre = (id: string) => {
    set('genreIds', values.genreIds.includes(id) ? values.genreIds.filter((g) => g !== id) : [...values.genreIds, id]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...(!seriesId && values.tenantId ? { tenantId: values.tenantId } : {}),
      title: values.title,
      slug: values.slug,
      synopsis: values.synopsis || undefined,
      posterUrl: values.posterUrl || undefined,
      backdropUrl: values.backdropUrl || undefined,
      isPremium: values.isPremium,
      genreIds: values.genreIds,
    };

    try {
      if (seriesId) {
        await api.patch(`/series/${seriesId}`, payload, token);
      } else {
        await api.post('/series', payload, token);
      }
      router.push('/admin/series');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la serie');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-2xl flex-col gap-4">
      {!seriesId && <TenantSelectorField value={values.tenantId} onChange={(v) => set('tenantId', v)} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Título
          <input required value={values.title} onChange={(e) => set('title', e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Slug
          <input required value={values.slug} onChange={(e) => set('slug', e.target.value)} className={inputClass} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-white/70">
        Sinopsis
        <textarea
          value={values.synopsis}
          onChange={(e) => set('synopsis', e.target.value)}
          rows={3}
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Poster URL
          <input value={values.posterUrl} onChange={(e) => set('posterUrl', e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Backdrop URL
          <input value={values.backdropUrl} onChange={(e) => set('backdropUrl', e.target.value)} className={inputClass} />
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm text-white/70">Géneros</p>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              type="button"
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                values.genreIds.includes(genre.id) ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={values.isPremium} onChange={(e) => set('isPremium', e.target.checked)} />
        Contenido Premium
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
