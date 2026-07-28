import Link from 'next/link';

export function PremiumLock({ title }: { title: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-lg bg-surface text-center">
      <span className="rounded bg-primary px-3 py-1 text-xs font-bold tracking-wide text-white">
        PREMIUM
      </span>
      <p className="max-w-sm text-white/70">
        <span className="font-semibold text-white">{title}</span> es contenido Premium.
        Suscríbete para verlo.
      </p>
      <Link
        href="/planes"
        className="rounded-md bg-white px-6 py-2.5 font-bold text-black transition hover:bg-white/85"
      >
        Ver planes
      </Link>
    </div>
  );
}
