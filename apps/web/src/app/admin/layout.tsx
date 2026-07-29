'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CONTENT_MANAGER_ROLES, GLOBAL_ADMIN_ROLES, hasAnyRole } from '@/lib/admin-roles';

const NAV_ITEMS = [
  { href: '/admin/peliculas', label: 'Películas' },
  { href: '/admin/series', label: 'Series' },
  { href: '/admin/generos', label: 'Géneros' },
  { href: '/admin/canales', label: 'Canales' },
  { href: '/admin/planes', label: 'Planes' },
  { href: '/admin/usuarios', label: 'Usuarios', requiresGlobalAdmin: true },
  { href: '/admin/tenants', label: 'Tenants', requiresGlobalAdmin: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-white/50">Cargando…</div>;
  }

  if (!user || !hasAnyRole(user.roles, CONTENT_MANAGER_ROLES)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-white/60">
        No tienes permiso para ver esta sección.
      </div>
    );
  }

  const isGlobalAdmin = hasAnyRole(user.roles, GLOBAL_ADMIN_ROLES);

  return (
    <div className="flex min-h-screen pt-16">
      <aside className="w-56 flex-none border-r border-white/10 px-4 py-6">
        <p className="mb-4 px-2 text-xs font-bold uppercase tracking-wide text-white/40">Administración</p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.filter((item) => !item.requiresGlobalAdmin || isGlobalAdmin).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                pathname?.startsWith(item.href) ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 px-6 py-6 sm:px-8">{children}</div>
    </div>
  );
}
