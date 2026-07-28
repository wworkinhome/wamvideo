'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 transition-colors duration-300 sm:px-6 md:px-12 ${
        scrolled ? 'bg-background shadow-lg shadow-black/40' : 'bg-gradient-to-b from-black/85 via-black/40 to-transparent'
      }`}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-black italic tracking-tight text-primary sm:text-2xl">
          WAMVIDEO
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-white/80 sm:flex">
          <Link href="/catalogo" className="transition hover:text-white">
            Catálogo
          </Link>
          <Link href="/canales" className="transition hover:text-white">
            Canales
          </Link>
          <Link href="/guia" className="transition hover:text-white">
            Guía de TV
          </Link>
          <Link href="/planes" className="transition hover:text-white">
            Planes
          </Link>
          {!loading && user && (
            <Link href="/favoritos" className="transition hover:text-white">
              Mi lista
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2 text-sm text-white/80 sm:gap-4">
        {!loading && !user && (
          <>
            <Link href="/login" className="hidden transition hover:text-white sm:inline">
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90 sm:px-4 sm:text-sm"
            >
              Crear cuenta
            </Link>
          </>
        )}
        {!loading && user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-white/60 sm:inline">{user.name}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="rounded bg-white/10 px-3 py-1.5 transition hover:bg-white/20"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
