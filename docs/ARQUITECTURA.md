# Arquitectura — WAMVIDEO

## Visión general

```
┌────────────────┐        ┌─────────────────┐        ┌──────────────┐
│  Next.js (Web)  │──────▶│   API NestJS     │──────▶│  PostgreSQL  │
│  Vercel         │◀──────│  Railway/Contabo │◀──────│  (Prisma)    │
└────────────────┘        └─────────────────┘        └──────────────┘
                                   │  │
                                   │  └───────────────▶ Redis (cache, colas)
                                   │
                                   ├──────────────────▶ MinIO / Supabase Storage
                                   │                    (assets, video, subtítulos)
                                   │
                                   └──────────────────▶ FFmpeg Workers
                                                        (transcodificación, HLS, DVR)

CDN sirve los manifests/segmentos HLS al Reproductor (web/móvil/Smart TV).
Nginx actúa como reverse proxy / edge para API y streaming en Contabo.
Prometheus + Grafana monitorean API, workers e infraestructura.
```

## Componentes

- **Frontend (Next.js, Vercel)**: landing, catálogo, reproductor, área de
  usuario, panel de administración (fases posteriores), Creator Studio.
- **API (NestJS, Railway/Contabo)**: autenticación y autorización basada en
  roles, catálogo (películas/series), TV en vivo/EPG, eventos, pagos,
  notificaciones, analíticas, administración multi-tenant.
- **PostgreSQL + Prisma**: base de datos relacional principal, ORM
  tipado compartido por toda la API.
- **Redis**: caché de sesiones/catálogo, colas de trabajos (BullMQ) para
  transcodificación y notificaciones.
- **MinIO / Supabase Storage**: almacenamiento de objetos para video
  fuente, imágenes, subtítulos y descargas offline.
- **FFmpeg Workers**: transcodificación a HLS (múltiples calidades),
  generación de thumbnails, DVR/Catch-up TV/TimeShift.
- **CDN**: distribución de manifests (.m3u8) y segmentos (.ts/.m4s).
- **Docker**: empaquetado de API, workers y servicios de infraestructura
  para desarrollo y despliegue en Contabo.
- **Prometheus/Grafana**: métricas de API, workers, streaming y alertas.

## Multi-tenant (Fase 3)

Cada `Tenant` agrupa su propio branding, catálogo, planes y usuarios
administrativos. El `Administrador Tenant` gestiona su propio tenant; el
`Super Administrador` gestiona todos los tenants, planes globales y
suspensión de usuarios.

## Seguridad

- JWT (access + refresh token) para autenticación de usuarios.
- RBAC (control de acceso basado en roles) — ver enum `Role` en
  `apps/api/prisma/schema.prisma`.
- Auditoría de acciones administrativas en la tabla `AuditLog`.
- DRM (Fase 4) para contenido premium/PPV.
