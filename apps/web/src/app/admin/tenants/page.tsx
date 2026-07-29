'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Tenant } from '@/lib/api';

interface FormValues {
  id: string | null;
  name: string;
  slug: string;
  domain: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

const EMPTY_FORM: FormValues = { id: null, name: '', slug: '', domain: '', status: 'ACTIVE' };

const inputClass =
  'w-full rounded-md border border-white/10 bg-surface px-4 py-2.5 text-white outline-none focus:border-white/30';

export default function AdminTenantsPage() {
  const { token } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    api
      .get<Tenant[]>('/tenants', token)
      .then(setTenants)
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const startEdit = (tenant: Tenant) => {
    setForm({ id: tenant.id, name: tenant.name, slug: tenant.slug, domain: tenant.domain ?? '', status: tenant.status });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      domain: form.domain || undefined,
      status: form.status,
    };

    try {
      if (form.id) {
        await api.patch(`/tenants/${form.id}`, payload, token);
      } else {
        await api.post('/tenants', payload, token);
      }
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        '¿Eliminar este tenant? Esto borra en cascada TODO su contenido (películas, series, canales, géneros, planes). Considera suspenderlo en vez de eliminarlo.',
      )
    )
      return;
    await api.delete(`/tenants/${id}`, token).catch((err) => alert(err instanceof Error ? err.message : 'No se pudo eliminar'));
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Tenants</h1>
      <p className="mt-1 max-w-2xl text-sm text-white/50">
        Cada tenant es una organización con su propio catálogo, canales y usuarios aislados. El enrutamiento
        automático por dominio (mapear un host a un tenant en el sitio público) todavía no está implementado —
        por ahora la app sigue sirviendo el contenido del tenant configurado como predeterminado.
      </p>

      {loading ? (
        <p className="mt-6 text-white/50">Cargando…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg ring-1 ring-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Dominio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-t border-white/5 text-white">
                  <td className="px-4 py-3">{tenant.name}</td>
                  <td className="px-4 py-3 text-white/50">{tenant.slug}</td>
                  <td className="px-4 py-3 text-white/50">{tenant.domain ?? '—'}</td>
                  <td className="px-4 py-3">{tenant.status === 'ACTIVE' ? 'Activo' : 'Suspendido'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(tenant)} className="mr-4 text-white/70 hover:text-white">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(tenant.id)} className="text-white/50 hover:text-red-400">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tenants.length === 0 && <p className="p-4 text-white/50">Sin tenants.</p>}
        </div>
      )}

      <h2 className="mb-4 mt-8 text-lg font-semibold text-white">{form.id ? 'Editar tenant' : 'Nuevo tenant'}</h2>
      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Nombre
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Slug
            <input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="(se genera del nombre si se deja vacío)"
              className={inputClass}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Dominio (opcional)
          <input
            value={form.domain}
            onChange={(e) => set('domain', e.target.value)}
            placeholder="cliente.wamvideo.com"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Estado
          <select value={form.status} onChange={(e) => set('status', e.target.value as 'ACTIVE' | 'SUSPENDED')} className={inputClass}>
            <option value="ACTIVE">Activo</option>
            <option value="SUSPENDED">Suspendido</option>
          </select>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded-md bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Crear tenant'}
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
