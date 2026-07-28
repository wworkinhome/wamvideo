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

## Usando Supabase en vez de Postgres local

En lugar de `docker compose up -d`, puedes usar un proyecto de Supabase como
base de datos. Prisma necesita dos URLs distintas (ver comentarios en
`apps/api/.env.example`):

- `DATABASE_URL`: connection string del **Transaction pooler** (puerto
  `6543`, compatible con IPv4) — la usa la app en tiempo de ejecución.
- `DIRECT_URL`: connection string de **Direct connection** (puerto `5432`) —
  la usa Prisma solo para migraciones (`prisma migrate`, `prisma db pull`).
  Requiere que tu red soporte IPv6, ya que Supabase solo expone esa conexión
  por IPv6.

Ambas están en el dashboard de Supabase → **Settings → Database**. Luego de
configurarlas en `apps/api/.env`, sigue con los mismos pasos de migración y
seed de la sección anterior.

Para revisar qué hay en una base de Supabase ya existente sin modificar
nada, corre desde `apps/api`:

```bash
npx prisma db pull --print
```

Esto imprime el esquema detectado sin tocar `schema.prisma` ni la base.

## Documentación

- [Proyecto Maestro](./docs/PROYECTO_MAESTRO.md)
- [Arquitectura](./docs/ARQUITECTURA.md)
- [Base de datos](./docs/BASE_DE_DATOS.md)
- [Roadmap](./docs/ROADMAP.md)
