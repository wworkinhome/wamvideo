'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Tenant } from '@/lib/api';
import { ALL_ROLE_NAMES, GLOBAL_ADMIN_ROLES, hasAnyRole } from '@/lib/admin-roles';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  status: string;
  role: string;
  roles: string[];
  globalRoles?: string[];
  tenantRoles?: Record<string, string[]>;
}

const STATUSES = ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DELETED'];
const GLOBAL_SCOPE = '__global__';

export default function AdminUsuariosPage() {
  const { user: authUser, token } = useAuth();
  const isGlobalAdmin = hasAnyRole(authUser?.roles, GLOBAL_ADMIN_ROLES);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState('ACTIVE');
  const [scope, setScope] = useState(GLOBAL_SCOPE);
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

  useEffect(() => {
    if (!isGlobalAdmin) return;
    api
      .get<Tenant[]>('/tenants', token)
      .then(setTenants)
      .catch(() => setTenants([]));
  }, [isGlobalAdmin, token]);

  const rolesForScope = (user: AdminUser, scopeValue: string) =>
    scopeValue === GLOBAL_SCOPE ? (user.globalRoles ?? user.roles) : (user.tenantRoles?.[scopeValue] ?? []);

  const startEdit = (user: AdminUser) => {
    setEditingUser(user);
    setStatus(user.status);
    setScope(GLOBAL_SCOPE);
    setRoles(rolesForScope(user, GLOBAL_SCOPE));
    setError(null);
  };

  const changeScope = (scopeValue: string) => {
    setScope(scopeValue);
    if (editingUser) setRoles(rolesForScope(editingUser, scopeValue));
  };

  const toggleRole = (role: string) => {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/users/${editingUser.id}/status`, { status }, token);
      await api.patch(
        `/users/${editingUser.id}/roles`,
        { roles, ...(scope !== GLOBAL_SCOPE ? { tenantId: scope } : {}) },
        token,
      );
      setEditingUser(null);
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
                  <td className="px-4 py-3 text-white/50">
                    {(user.globalRoles ?? user.roles).join(', ') || '—'}
                    {user.tenantRoles && Object.keys(user.tenantRoles).length > 0 && (
                      <div className="mt-1 text-xs text-white/30">
                        {Object.entries(user.tenantRoles).map(([tenantId, tenantRoleNames]) => (
                          <div key={tenantId}>
                            {(tenants.find((t) => t.id === tenantId)?.name ?? tenantId)}: {tenantRoleNames.join(', ')}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
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

      {editingUser && (
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

          {isGlobalAdmin && tenants.length > 0 && (
            <label className="mt-4 flex flex-col gap-1 text-sm text-white/70">
              Ámbito de los roles
              <select
                value={scope}
                onChange={(e) => changeScope(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-background px-4 py-2.5 text-white outline-none focus:border-white/30"
              >
                <option value={GLOBAL_SCOPE}>Global (todos los tenants)</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    Solo en: {tenant.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <p className="mb-2 mt-4 text-sm text-white/70">
            Roles {scope !== GLOBAL_SCOPE && `(solo dentro de ${tenants.find((t) => t.id === scope)?.name ?? scope})`}
          </p>
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
              onClick={() => setEditingUser(null)}
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
