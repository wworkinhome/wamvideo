'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { GLOBAL_ADMIN_ROLES, hasAnyRole } from '@/lib/admin-roles';
import { api, Tenant } from '@/lib/api';

// Solo ROOT/SUPER_ADMIN pueden elegir en qué tenant crear contenido — un gestor de
// contenido normal siempre queda fijo a su propio tenant (lo resuelve el backend).
export function useTenantOptions() {
  const { user, token } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const isGlobalAdmin = hasAnyRole(user?.roles, GLOBAL_ADMIN_ROLES);

  useEffect(() => {
    if (!isGlobalAdmin) return;
    api
      .get<Tenant[]>('/tenants', token)
      .then(setTenants)
      .catch(() => setTenants([]));
  }, [isGlobalAdmin, token]);

  return { isGlobalAdmin, tenants };
}

export function TenantSelectorField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { isGlobalAdmin, tenants } = useTenantOptions();

  if (!isGlobalAdmin || tenants.length === 0) {
    return null;
  }

  return (
    <label className="flex flex-col gap-1 text-sm text-white/70">
      Tenant
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-surface px-4 py-2.5 text-white outline-none focus:border-white/30"
      >
        <option value="">(tu tenant por defecto)</option>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </label>
  );
}
