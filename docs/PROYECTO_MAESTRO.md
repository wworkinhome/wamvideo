# WAMVIDEO — Proyecto Maestro

## Visión

WAMVIDEO es una plataforma OTT/SaaS que integra streaming bajo demanda (VOD),
TV en vivo, eventos en vivo, guía electrónica de programación (EPG),
inteligencia artificial y aplicaciones web/móviles.

## Tecnologías

Next.js, NestJS, PostgreSQL, Prisma, Redis, Supabase Storage, Docker, Nginx,
FFmpeg, HLS, Vercel, Railway, Contabo.

## Módulos

Landing, Catálogo, Películas, Series, TV en Vivo, EPG, Eventos, Reproductor,
Favoritos, Continuar viendo, Descargas, IA, Creator Studio, Administración,
Analíticas, Pagos, Notificaciones.

## Características

Perfiles, recomendaciones IA, subtítulos, múltiples audios, Chromecast,
AirPlay, PiP, Watch Party, Live Streaming, PPV, paquetes de canales, planes,
DVR, Catch-up TV, TimeShift.

## Roles

ROOT, Super Administrador, Administrador General, Administrador Tenant,
Editor, Productor, Moderador, Soporte, Analista, Usuario Premium, Usuario
Estándar, Usuario Gratuito e Invitado. El Super Administrador puede
crear/suspender usuarios, administrar planes, paquetes y tenants.

## Arquitectura

Frontend Next.js (Vercel), API NestJS (Railway/Contabo), PostgreSQL, Redis,
MinIO, FFmpeg Workers, CDN, Docker y monitoreo con Prometheus/Grafana. Ver
detalle en [ARQUITECTURA.md](./ARQUITECTURA.md).

## Base de datos

Incluye tablas para usuarios, roles, permisos, películas, series,
temporadas, episodios, canales, EPG, eventos, suscripciones, planes, pagos,
comentarios, historial, favoritos, dispositivos, auditoría, tenants y
branding. Ver detalle en [BASE_DE_DATOS.md](./BASE_DE_DATOS.md) y el schema
en [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma).

## Roadmap

Ver [ROADMAP.md](./ROADMAP.md) para el detalle de fases y estado de avance.

- **Fase 1**: MVP VOD.
- **Fase 2**: Suscripciones y App móvil.
- **Fase 3**: TV en vivo, EPG y SaaS multi-tenant.
- **Fase 4**: IA, Smart TV, DRM y escalabilidad.

## Estado actual del repositorio

Este repositorio contiene el scaffolding inicial del monorepo, la
implementación funcional de la Fase 1 (MVP VOD), planes/suscripciones de
la Fase 2 y un primer avance de la Fase 3 (Guía Electrónica de
Programación):

- `apps/api`: backend NestJS + Prisma con autenticación, catálogo de
  películas/series, favoritos, historial de reproducción, canales/EPG y
  planes/suscripciones con bloqueo real de contenido Premium.
- `apps/web`: frontend Next.js con landing, catálogo, ficha de
  película/serie, reproductor HLS, login/registro, favoritos, una Guía
  de TV (`/guia`) con panel de vista previa, filtro por categoría y
  grilla de horarios con línea de "ahora en vivo", y una página de
  planes (`/planes`) para suscribirse/cancelar.
- `docs/`: documentación funcional, técnica y de arquitectura.

Los módulos de ingesta real de TV en vivo, eventos, pasarela de pago real,
IA y administración multi-tenant están documentados y modelados en la base
de datos, pero su implementación completa corresponde a las fases 2 a 4 del
roadmap.

Este documento resume el proyecto maestro. La documentación funcional,
técnica, de arquitectura, API, base de datos y UX puede expandirse a varios
cientos de páginas conforme el proyecto avance.
