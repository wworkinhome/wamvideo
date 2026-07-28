# Roadmap — WAMVIDEO

## Fase 1 — MVP VOD (implementado en este repositorio)

- [x] Monorepo (apps/web, apps/api) con Docker Compose de infraestructura.
- [x] Modelo de datos completo en Prisma (incluye entidades de fases
      futuras para no romper migraciones más adelante).
- [x] Autenticación (registro/login con JWT, roles de usuario).
- [x] Catálogo de películas y series (listado, detalle, temporadas y
      episodios).
- [x] Reproductor HLS básico (web, vía hls.js).
- [x] Favoritos y "Continuar viendo".
- [x] Landing pública.

## Fase 2 — Suscripciones y App móvil

- [x] Planes y suscripciones: página `/planes`, alta/cancelación desde la
      API (`/subscriptions`). El cobro es manual (`PaymentProvider.MANUAL`);
      falta integrar una pasarela real (Stripe u otra).
- [x] Restricción de contenido por plan: películas/series/canales
      `isPremium` ocultan su `videoUrl`/`streamUrl` en la API si el usuario
      no tiene una suscripción activa de pago, mostrando un candado en el
      reproductor con CTA a `/planes`.
- [ ] Subtítulos y múltiples audios en el reproductor.
- [ ] Chromecast, AirPlay, Picture-in-Picture.
- [ ] Descargas offline.
- [ ] App móvil (React Native / Expo) reutilizando la API.

## Fase 3 — TV en vivo, EPG y SaaS multi-tenant

- [x] Guía Electrónica de Programación (EPG): página `/guia` con panel de
      vista previa, filtro por categoría, línea de "ahora" y grilla de
      horarios por canal; página `/canal/[slug]` con reproductor en vivo.
- [ ] Ingesta real de canales en vivo y workers FFmpeg para HLS (hoy los
      canales usan streams de ejemplo).
- [ ] Eventos en vivo y Pay-Per-View (PPV).
- [ ] Paquetes de canales.
- [ ] DVR, Catch-up TV, TimeShift.
- [ ] Multi-tenant completo: branding, dominios, administración por tenant.
- [ ] Watch Party.

## Fase 4 — IA, Smart TV, DRM y escalabilidad

- [ ] Recomendaciones con IA.
- [ ] Creator Studio (subida y gestión de contenido por productores).
- [ ] Apps para Smart TV (Tizen, WebOS, Android TV, Apple TV).
- [ ] DRM para contenido premium/PPV.
- [ ] Analíticas avanzadas y paneles de Administración.
- [ ] Escalabilidad horizontal (CDN multi-región, autoscaling de workers).
