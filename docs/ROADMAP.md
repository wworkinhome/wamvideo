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

- [ ] Planes y suscripciones (Stripe u otra pasarela de pagos).
- [ ] Restricción de contenido por plan (Free/Estándar/Premium).
- [ ] Subtítulos y múltiples audios en el reproductor.
- [ ] Chromecast, AirPlay, Picture-in-Picture.
- [ ] Descargas offline.
- [ ] App móvil (React Native / Expo) reutilizando la API.

## Fase 3 — TV en vivo, EPG y SaaS multi-tenant

- [ ] Ingesta de canales en vivo y workers FFmpeg para HLS.
- [ ] Guía Electrónica de Programación (EPG).
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
