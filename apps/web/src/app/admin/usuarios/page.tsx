'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { ALL_ROLE_NAMES } from '@/lib/admin-roles';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  status: string;
  role: string;
  roles: string[];
}

const STATUSES = ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DELETED'];

export default function AdminUsuariosPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState('ACTIVE');
  const [roles, setRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    api
      .get<AdminUser[]>('/users', token)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setStatus(user.status);
    setRoles(user.roles);
    setError(null);
  };

  const toggleRole = (role: string) => {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/users/${editingId}/status`, { status }, token);
      await api.patch(`/users/${editingId}/roles`, { roles }, token);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Usuarios</h1>

      {loading ? (
        <p className="mt-6 text-white/50">Cargando…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg ring-1 ring-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/5 text-white">
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 text-white/50">{user.name}</td>
                  <td className="px-4 py-3 text-white/50">{user.status}</td>
                  <td className="px-4 py-3 text-white/50">{user.roles.join(', ')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(user)} className="text-white/70 hover:text-white">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="p-4 text-white/50">Sin usuarios.</p>}
        </div>
      )}

      {editingId && (
        <div className="mt-8 max-w-xl rounded-lg bg-surface p-5 ring-1 ring-white/10">
          <h2 className="text-lg font-semibold text-white">Editar usuario</h2>

          <label className="mt-4 flex flex-col gap-1 text-sm text-white/70">
            Estado
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-background px-4 py-2.5 text-white outline-none focus:border-white/30"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <p className="mb-2 mt-4 text-sm text-white/70">Roles</p>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLE_NAMES.map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => toggleRole(role)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  roles.includes(role) ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="rounded-md border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
