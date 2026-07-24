# Base de datos — WAMVIDEO

El modelo de datos vive en [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma).
Resumen de las entidades principales:

| Dominio | Modelos |
|---|---|
| Identidad | `User`, `Role` (enum), `Device`, `AuditLog` |
| Catálogo VOD | `Movie`, `Series`, `Season`, `Episode`, `Genre`, `Cast` |
| TV en vivo | `Channel`, `EpgProgram` |
| Eventos | `Event` |
| Interacción | `Favorite`, `WatchHistory`, `Comment` |
| Monetización | `Plan`, `Subscription`, `Payment` |
| SaaS / multi-tenant | `Tenant`, `Branding` |

## Notas de diseño

- Todos los modelos usan `cuid()` como identificador primario.
- `Movie`, `Series`, `Channel` y `Event` están vinculados opcionalmente a un
  `Tenant` para soportar el modelo multi-tenant de la Fase 3 (en Fase 1
  puede operarse con un único tenant implícito).
- `WatchHistory` guarda `progressSeconds` y `durationSeconds` para soportar
  "Continuar viendo".
- `Subscription` referencia a `Plan` y al `User`; `Payment` referencia a
  `Subscription` para el historial de cobros.
- El enum `Role` cubre los roles descritos en el documento maestro: `ROOT`,
  `SUPER_ADMIN`, `ADMIN_GENERAL`, `ADMIN_TENANT`, `EDITOR`, `PRODUCER`,
  `MODERATOR`, `SUPPORT`, `ANALYST`, `PREMIUM_USER`, `STANDARD_USER`,
  `FREE_USER`, `GUEST`.

Este documento se ampliará con diagramas ER y diccionario de datos completo
a medida que evolucionen las fases 2 a 4 (EPG detallado, DVR, PPV, DRM).
