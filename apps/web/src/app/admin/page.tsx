import Link from 'next/link';

const CARDS = [
  { href: '/admin/peliculas', label: 'Películas', desc: 'Gestionar catálogo de películas.' },
  { href: '/admin/series', label: 'Series', desc: 'Gestionar catálogo de series.' },
  { href: '/admin/generos', label: 'Géneros', desc: 'Categorías de películas y series.' },
  { href: '/admin/canales', label: 'Canales', desc: 'TV en vivo, EPG e importar M3U.' },
  { href: '/admin/planes', label: 'Planes', desc: 'Planes de suscripción y precios.' },
  { href: '/admin/usuarios', label: 'Usuarios', desc: 'Roles y estado de las cuentas.' },
];

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Panel de administración</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg bg-surface p-5 ring-1 ring-white/10 transition hover:ring-white/30"
          >
            <h2 className="text-lg font-semibold text-white">{card.label}</h2>
            <p className="mt-1 text-sm text-white/60">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
