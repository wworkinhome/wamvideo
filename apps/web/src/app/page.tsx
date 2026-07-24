import Link from 'next/link';

export default function LandingPage() {
  return (
    <div>
      <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-gradient-to-b from-surface to-background px-6 text-center">
        <h1 className="text-4xl font-bold md:text-6xl">
          Todo tu entretenimiento en <span className="text-primary">WAMVIDEO</span>
        </h1>
        <p className="max-w-2xl text-lg text-white/70">
          Streaming bajo demanda, TV en vivo, eventos y guía de programación en una sola
          plataforma. Películas, series y contenido original en cualquier dispositivo.
        </p>
        <Link
          href="/catalogo"
          className="rounded-md bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
        >
          Explorar catálogo
        </Link>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-16 md:grid-cols-3">
        {[
          { title: 'VOD ilimitado', desc: 'Miles de películas y series bajo demanda.' },
          { title: 'TV en vivo', desc: 'Canales en vivo con EPG y catch-up (próximamente).' },
          { title: 'Multiplataforma', desc: 'Web, móvil y pronto Smart TV.' },
        ].map((feature) => (
          <div key={feature.title} className="rounded-lg bg-surface p-6">
            <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm text-white/60">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
