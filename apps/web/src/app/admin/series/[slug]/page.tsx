'use client';

import { useEffect, useState } from 'react';
import { api, Series } from '@/lib/api';
import { SeriesForm, seriesToFormValues } from '../series-form';

export default function EditarSeriePage({ params }: { params: { slug: string } }) {
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Series>(`/series/${params.slug}`)
      .then(setSeries)
      .catch(() => setSeries(null))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return <p className="text-white/50">Cargando…</p>;
  }

  if (!series) {
    return <p className="text-white/50">Serie no encontrada.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Editar serie</h1>
      <SeriesForm initialValues={seriesToFormValues(series)} seriesId={series.id} />
    </div>
  );
}
