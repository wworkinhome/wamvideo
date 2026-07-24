'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-background/95 px-6 py-4 backdrop-blur">
      <Link href="/" className="text-xl font-bold tracking-wide text-primary">
        WAMVIDEO
      </Link>
      <nav className="flex items-center gap-6 text-sm text-white/80">
        <Link href="/catalogo">Catálogo</Link>
        {!loading && user && <Link href="/favoritos">Favoritos</Link>}
        {!loading && !user && <Link href="/login">Iniciar sesión</Link>}
        {!loading && !user && <Link href="/registro">Crear cuenta</Link>}
        {!loading && user && (
          <div className="flex items-center gap-3">
            <span className="text-white/60">{user.name}</span>
            <button onClick={logout} className="rounded bg-white/10 px-3 py-1 hover:bg-white/20">
              Salir
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
