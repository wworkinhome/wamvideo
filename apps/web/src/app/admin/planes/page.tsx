'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Plan } from '@/lib/api';

interface FormValues {
  id: string | null;
  name: string;
  description: string;
  price: string;
  billingInterval: 'MONTHLY' | 'YEARLY';
  maxProfiles: string;
  maxDevices: string;
  videoQuality: string;
  isActive: boolean;
}

const EMPTY_FORM: FormValues = {
  id: null,
  name: '',
  description: '',
  price: '',
  billingInterval: 'MONTHLY',
  maxProfiles: '1',
  maxDevices: '1',
  videoQuality: 'HD',
  isActive: true,
};

const inputClass =
  'w-full rounded-md border border-white/10 bg-surface px-4 py-2.5 text-white outline-none focus:border-white/30';

export default function AdminPlanesPage() {
  const { token } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    api
      .get<Plan[]>('/plans/admin', token)
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const startEdit = (plan: Plan) => {
    setForm({
      id: plan.id,
      name: plan.name,
      description: plan.description ?? '',
      price: (plan.priceCents / 100).toString(),
      billingInterval: plan.billingInterval ?? 'MONTHLY',
      maxProfiles: String(plan.maxProfiles),
      maxDevices: String(plan.maxDevices ?? 1),
      videoQuality: plan.maxQuality,
      isActive: plan.isActive ?? true,
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      billingInterval: form.billingInterval,
      maxProfiles: Number(form.maxProfiles),
      maxDevices: Number(form.maxDevices),
      videoQuality: form.videoQuality || undefined,
      isActive: form.isActive,
    };

    try {
      if (form.id) {
        await api.patch(`/plans/${form.id}`, payload, token);
      } else {
        await api.post('/plans', payload, token);
      }
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este plan?')) return;
    await api.delete(`/plans/${id}`, token).catch(() => {});
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Planes</h1>

      {loading ? (
        <p className="mt-6 text-white/50">Cargando…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg ring-1 ring-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Ciclo</th>
                <th className="px-4 py-3">Perfiles</th>
                <th className="px-4 py-3">Activo</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-t border-white/5 text-white">
                  <td className="px-4 py-3">{plan.name}</td>
                  <td className="px-4 py-3 text-white/50">
                    {(plan.priceCents / 100).toLocaleString('es-MX', { style: 'currency', currency: plan.currency })}
                  </td>
                  <td className="px-4 py-3 text-white/50">{plan.billingInterval === 'YEARLY' ? 'Anual' : 'Mensual'}</td>
                  <td className="px-4 py-3 text-white/50">{plan.maxProfiles}</td>
                  <td className="px-4 py-3">{plan.isActive ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(plan)} className="mr-4 text-white/70 hover:text-white">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(plan.id)} className="text-white/50 hover:text-red-400">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {plans.length === 0 && <p className="p-4 text-white/50">Aún no hay planes.</p>}
        </div>
      )}

      <h2 className="mb-4 mt-8 text-lg font-semibold text-white">{form.id ? 'Editar plan' : 'Nuevo plan'}</h2>
      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Nombre
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Precio (USD)
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Descripción
          <input value={form.description} onChange={(e) => set('description', e.target.value)} className={inputClass} />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Ciclo de cobro
            <select
              value={form.billingInterval}
              onChange={(e) => set('billingInterval', e.target.value as 'MONTHLY' | 'YEARLY')}
              className={inputClass}
            >
              <option value="MONTHLY">Mensual</option>
              <option value="YEARLY">Anual</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Máx. perfiles
            <input
              type="number"
              min="1"
              value={form.maxProfiles}
              onChange={(e) => set('maxProfiles', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Máx. dispositivos
            <input
              type="number"
              min="1"
              value={form.maxDevices}
              onChange={(e) => set('maxDevices', e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Calidad de video
          <input value={form.videoQuality} onChange={(e) => set('videoQuality', e.target.value)} className={inputClass} />
        </label>

        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          Plan activo (visible para suscribirse)
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded-md bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Crear plan'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(EMPTY_FORM)}
              className="rounded-md border border-white/20 px-6 py-2.5 font-semibold text-white transition hover:bg-white/10"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
