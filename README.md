# WAMVIDEO

Plataforma OTT/SaaS de streaming (VOD, TV en vivo, eventos, EPG, IA).

Ver la visión completa del proyecto en [`docs/PROYECTO_MAESTRO.md`](./docs/PROYECTO_MAESTRO.md).

## Estructura del monorepo

```
apps/
  api/    API backend (NestJS + Prisma + PostgreSQL)
  web/    Frontend (Next.js + Tailwind CSS)
docs/     Documentación funcional, técnica y de arquitectura
```

## Requisitos

- Node.js 20+
- Docker y Docker Compose (para PostgreSQL, Redis y MinIO en desarrollo)

## Puesta en marcha (desarrollo)

```bash
# 1. Levantar infraestructura (Postgres, Redis, MinIO)
docker compose up -d

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 4. Migrar y poblar la base de datos
npm run prisma:migrate --workspace apps/api
npm run prisma:seed --workspace apps/api

# 5. Levantar API y Web juntos
npm run dev
```

- API: http://localhost:4000
- Web: http://localhost:3000

Si prefieres levantarlos por separado (por ejemplo, en dos terminales):

```bash
npm run dev:api   # API (NestJS) en http://localhost:4000
npm run dev:web   # Web (Next.js) en http://localhost:3000
```

## Documentación

- [Proyecto Maestro](./docs/PROYECTO_MAESTRO.md)
- [Arquitectura](./docs/ARQUITECTURA.md)
- [Base de datos](./docs/BASE_DE_DATOS.md)
- [Roadmap](./docs/ROADMAP.md)
