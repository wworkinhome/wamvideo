import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// El tenant real de producción en Supabase quedó creado con slug "demo"
// (contiene el catálogo real: 14,893 canales, etc.), no "wamvideo".
const DEFAULT_TENANT_SLUG = 'demo';

const ROLE_NAMES = {
  ROOT: 'ROOT',
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_GENERAL: 'ADMIN_GENERAL',
  ADMIN_TENANT: 'ADMIN_TENANT',
  EDITOR: 'EDITOR',
  PRODUCER: 'PRODUCER',
  MODERATOR: 'MODERATOR',
  SUPPORT: 'SUPPORT',
  ANALYST: 'ANALYST',
  PREMIUM_USER: 'PREMIUM_USER',
  STANDARD_USER: 'STANDARD_USER',
  FREE_USER: 'FREE_USER',
  GUEST: 'GUEST',
} as const;

type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

const GLOBAL_ADMIN_ROLES: RoleName[] = [ROLE_NAMES.ROOT, ROLE_NAMES.SUPER_ADMIN];
const CONTENT_MANAGER_ROLES: RoleName[] = [
  ROLE_NAMES.ROOT,
  ROLE_NAMES.SUPER_ADMIN,
  ROLE_NAMES.ADMIN_GENERAL,
  ROLE_NAMES.ADMIN_TENANT,
  ROLE_NAMES.EDITOR,
  ROLE_NAMES.PRODUCER,
];

// Emails que ya existían en la base de datos de Supabase antes de esta migración
// de esquema. Solo se les vincula un rol vía user_roles; su password_hash nunca
// se toca aquí.
const EXISTING_USER_ROLES: Record<string, RoleName> = {
  'wworkinghome@gmail.com': ROLE_NAMES.SUPER_ADMIN,
  'root@wamvideo.local': ROLE_NAMES.ROOT,
  'wmosqueraf@gmail.com': ROLE_NAMES.FREE_USER,
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Streams HLS públicos de referencia, usados solo como datos de ejemplo
// para el reproductor en desarrollo (no son contenido propio de WAMVIDEO).
const SAMPLE_HLS = {
  bigBuckBunny: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  sintel: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
};

const GENRE_NAMES = ['Acción', 'Drama', 'Comedia', 'Ciencia Ficción', 'Documental'] as const;

const PERMISSIONS: { code: string; description: string; roles: RoleName[] }[] = [
  { code: 'admin.full', description: 'Acceso total de administración', roles: GLOBAL_ADMIN_ROLES },
  { code: 'content.manage', description: 'Gestionar películas, series y canales', roles: CONTENT_MANAGER_ROLES },
  {
    code: 'users.manage',
    description: 'Gestionar usuarios',
    roles: [...GLOBAL_ADMIN_ROLES, ROLE_NAMES.ADMIN_GENERAL, ROLE_NAMES.ADMIN_TENANT],
  },
];

interface MovieSeed {
  title: string;
  slug: string;
  synopsis: string;
  releaseYear: number;
  durationMinutes: number;
  isPremium: boolean;
  genre: (typeof GENRE_NAMES)[number];
  videoUrl: string;
}

const MOVIES: MovieSeed[] = [
  {
    title: 'Big Buck Bunny',
    slug: 'big-buck-bunny',
    synopsis:
      'Un conejo gigante y bondadoso es provocado por tres roedores traviesos y decide vengarse.',
    releaseYear: 2008,
    durationMinutes: 10,
    isPremium: false,
    genre: 'Comedia',
    videoUrl: SAMPLE_HLS.bigBuckBunny,
  },
  {
    title: 'Sintel',
    slug: 'sintel',
    synopsis:
      'Una joven llamada Sintel busca a un pequeño dragón al que crió y con el que forjó un vínculo especial.',
    releaseYear: 2010,
    durationMinutes: 15,
    isPremium: true,
    genre: 'Ciencia Ficción',
    videoUrl: SAMPLE_HLS.sintel,
  },
  {
    title: 'Fragmentos de Medianoche',
    slug: 'fragmentos-de-medianoche',
    synopsis: 'Un escritor en crisis reconstruye su pasado a través de cartas nunca enviadas.',
    releaseYear: 2019,
    durationMinutes: 104,
    isPremium: false,
    genre: 'Drama',
    videoUrl: SAMPLE_HLS.bigBuckBunny,
  },
  {
    title: 'Pulso Extremo',
    slug: 'pulso-extremo',
    synopsis: 'Un exagente de inteligencia debe frustrar un golpe en las próximas 24 horas.',
    releaseYear: 2022,
    durationMinutes: 118,
    isPremium: true,
    genre: 'Acción',
    videoUrl: SAMPLE_HLS.sintel,
  },
  {
    title: 'Risas en Cadena',
    slug: 'risas-en-cadena',
    synopsis: 'Cinco desconocidos quedan atrapados en un ascensor la noche más caótica del año.',
    releaseYear: 2021,
    durationMinutes: 92,
    isPremium: false,
    genre: 'Comedia',
    videoUrl: SAMPLE_HLS.bigBuckBunny,
  },
  {
    title: 'Horizonte Digital',
    slug: 'horizonte-digital',
    synopsis: 'En 2090, una IA descubre que puede soñar y nadie sabe cómo detenerla.',
    releaseYear: 2023,
    durationMinutes: 130,
    isPremium: false,
    genre: 'Ciencia Ficción',
    videoUrl: SAMPLE_HLS.sintel,
  },
  {
    title: 'Voces del Silencio',
    slug: 'voces-del-silencio',
    synopsis: 'Un recorrido por comunidades que preservan lenguas a punto de desaparecer.',
    releaseYear: 2020,
    durationMinutes: 78,
    isPremium: false,
    genre: 'Documental',
    videoUrl: SAMPLE_HLS.bigBuckBunny,
  },
  {
    title: 'Código Rojo',
    slug: 'codigo-rojo',
    synopsis: 'Un equipo de élite debe detener un ciberataque que amenaza toda la red eléctrica.',
    releaseYear: 2024,
    durationMinutes: 112,
    isPremium: true,
    genre: 'Acción',
    videoUrl: SAMPLE_HLS.sintel,
  },
];

interface SeriesSeed {
  title: string;
  slug: string;
  synopsis: string;
  isPremium: boolean;
  genre: (typeof GENRE_NAMES)[number];
  episodes: { title: string; synopsis: string; durationMinutes: number }[];
}

const SERIES: SeriesSeed[] = [
  {
    title: 'WAMVIDEO Originals',
    slug: 'wamvideo-originals',
    synopsis: 'Serie de demostración con temporadas y episodios de ejemplo.',
    isPremium: false,
    genre: 'Drama',
    episodes: [
      { title: 'El comienzo', synopsis: 'Primer episodio de demostración.', durationMinutes: 10 },
    ],
  },
  {
    title: 'Noches de Neón',
    slug: 'noches-de-neon',
    synopsis: 'Tres amigas navegan la vida nocturna de una ciudad que nunca duerme.',
    isPremium: true,
    genre: 'Drama',
    episodes: [
      { title: 'Luces bajas', synopsis: 'Una fiesta cambia todo.', durationMinutes: 42 },
      { title: 'El after', synopsis: 'Los secretos empiezan a salir.', durationMinutes: 40 },
      { title: 'Amanecer', synopsis: 'Nada volverá a ser igual.', durationMinutes: 45 },
    ],
  },
  {
    title: 'Laboratorio 9',
    slug: 'laboratorio-9',
    synopsis: 'Un grupo de científicos experimenta con viajes en el tiempo en un búnker olvidado.',
    isPremium: false,
    genre: 'Ciencia Ficción',
    episodes: [
      { title: 'El experimento', synopsis: 'Todo comienza con un error de cálculo.', durationMinutes: 38 },
      { title: 'Bucle', synopsis: 'El mismo día, otra vez.', durationMinutes: 41 },
    ],
  },
];

interface ChannelSeed {
  name: string;
  slug: string;
  category: string;
  isPremium: boolean;
  synopsis: (title: string) => string;
  programs: string[];
}

const CHANNELS: ChannelSeed[] = [
  {
    name: 'WAM Novelas',
    slug: 'wam-novelas',
    category: 'Novelas',
    isPremium: false,
    synopsis: (t) => `Capítulo de la telenovela "${t}".`,
    programs: [
      'Amor Sin Fronteras',
      'Corazón Indomable',
      'Entre Copas',
      'Lo Que la Vida Me Dio',
      'Pasión y Poder',
      'Vivir a Destiempo',
      'Dulce Ambición',
      'Café con Aroma',
      'Reinas del Barrio',
      'Un Amor de Verdad',
      'Noches sin Ti',
      'La Herencia',
      'Mentiras Piadosas',
      'Segunda Oportunidad',
      'Cartas Nunca Enviadas',
      'Madrugada Eterna',
    ],
  },
  {
    name: 'WAM Cine',
    slug: 'wam-cine',
    category: 'Películas',
    isPremium: false,
    synopsis: (t) => `Función especial: "${t}".`,
    programs: [
      'Cine de Medianoche',
      'Clásicos del Cine',
      'Estreno de la Semana',
      'Maratón de Comedia',
      'Ciclo Ciencia Ficción',
      'Cine Familiar',
      'Función Doble',
      'Cine de Autor',
      'Sesión Continua',
      'Taquilla del Mes',
      'Cine Under',
      'Joyas Ocultas',
      'Noche de Terror',
      'Drama Contemporáneo',
      'Acción sin Pausa',
      'Cine de Culto',
    ],
  },
  {
    name: 'WAM Noticias',
    slug: 'wam-noticias',
    category: 'Noticias',
    isPremium: false,
    synopsis: (t) => `Cobertura informativa: "${t}".`,
    programs: [
      'Primera Edición',
      'Panorama Matutino',
      'Economía Hoy',
      'Al Instante',
      'Reporte Central',
      'Mundo en Foco',
      'Edición Mediodía',
      'Última Hora',
      'Enfoque Regional',
      'Tecnología y Sociedad',
      'Edición Vespertina',
      'Debate Nacional',
      'Cierre Informativo',
      'Noticias 24',
      'Resumen del Día',
      'Trasnoche Informativo',
    ],
  },
  {
    name: 'WAM Deportes',
    slug: 'wam-deportes',
    category: 'Deportes',
    isPremium: true,
    synopsis: (t) => `Transmisión deportiva: "${t}".`,
    programs: [
      'SportCenter WAM',
      'Fútbol en Vivo: Previa',
      'Fútbol en Vivo',
      'Post Partido',
      'Baloncesto Total',
      'Mundo Motor',
      'Boxeo Clásico',
      'Ronda de Campeones',
      'Tenis en Acción',
      'Deportes Extremos',
      'Grandes Rivalidades',
      'Resumen Deportivo',
      'Fútbol Internacional',
      'La Previa Nocturna',
      'Highlights de la Semana',
      'Trasnoche Deportivo',
    ],
  },
  {
    name: 'WAM Kids',
    slug: 'wam-kids',
    category: 'Kids',
    isPremium: false,
    synopsis: (t) => `Programa infantil: "${t}".`,
    programs: [
      'Aventuras de Buck Bunny',
      'Mundo Mágico',
      'Risas y Colores',
      'Exploradores Junior',
      'Cuentos para Crecer',
      'Súper Amigos',
      'Taller Creativo',
      'Dino Aventuras',
      'Canciones para Bailar',
      'Piratas del Patio',
      'Robots y Amigos',
      'Jardín de Sorpresas',
      'Hora del Cuento',
      'Campamento Divertido',
      'Estrellas del Espacio',
      'Buenas Noches Kids',
    ],
  },
];

const PROGRAM_BLOCK_MINUTES = 90; // 16 bloques x 90 min = 24h exactas

async function seedTenant() {
  return prisma.tenant.upsert({
    where: { slug: DEFAULT_TENANT_SLUG },
    create: { id: randomUUID(), name: 'Demo Tenant', slug: DEFAULT_TENANT_SLUG, updated_at: new Date() },
    update: {},
  });
}

async function seedRolesAndPermissions() {
  const roleIdByName = new Map<string, string>();
  for (const name of Object.values(ROLE_NAMES)) {
    const role = await prisma.roles.upsert({
      where: { name },
      create: { id: randomUUID(), name },
      update: {},
    });
    roleIdByName.set(name, role.id);
  }

  for (const permission of PERMISSIONS) {
    const created = await prisma.permissions.upsert({
      where: { code: permission.code },
      create: { id: randomUUID(), code: permission.code, description: permission.description },
      update: { description: permission.description },
    });

    for (const roleName of permission.roles) {
      const role_id = roleIdByName.get(roleName)!;
      await prisma.role_permissions.upsert({
        where: { role_id_permission_id: { role_id, permission_id: created.id } },
        create: { role_id, permission_id: created.id },
        update: {},
      });
    }
  }

  return roleIdByName;
}

async function ensureUserRole(userId: string, roleId: string, tenantId: string | null) {
  const existing = await prisma.user_roles.findFirst({
    where: { user_id: userId, role_id: roleId, tenant_id: tenantId },
  });
  if (!existing) {
    await prisma.user_roles.create({
      data: { id: randomUUID(), user_id: userId, role_id: roleId, tenant_id: tenantId },
    });
  }
}

async function ensureDefaultProfile(userId: string, name: string) {
  const existing = await prisma.profiles.findFirst({ where: { user_id: userId } });
  if (!existing) {
    await prisma.profiles.create({ data: { id: randomUUID(), user_id: userId, name } });
  }
}

async function linkExistingUsers(roleIdByName: Map<string, string>) {
  for (const [email, roleName] of Object.entries(EXISTING_USER_ROLES)) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      continue;
    }
    // Nunca se toca password_hash aquí: solo se vincula el rol y se asegura un perfil.
    await ensureUserRole(user.id, roleIdByName.get(roleName)!, null);
    await ensureDefaultProfile(user.id, user.name);
  }
}

async function seedDemoUsers(tenantId: string, roleIdByName: Map<string, string>) {
  const rootPassword = await bcrypt.hash('Admin123!', 10);
  const root = await prisma.user.upsert({
    where: { email: 'root@wamvideo.com' },
    create: {
      email: 'root@wamvideo.com',
      password_hash: rootPassword,
      name: 'Root WAMVIDEO',
      status: 'ACTIVE',
      tenant_id: tenantId,
      updated_at: new Date(),
    },
    update: {},
  });
  // ROOT es un rol global (como GLOBAL_ADMIN_ROLES en el backend) — nunca debe quedar
  // scoped a un tenant específico, o perdería acceso a cualquier otro tenant.
  await ensureUserRole(root.id, roleIdByName.get(ROLE_NAMES.ROOT)!, null);
  await ensureDefaultProfile(root.id, root.name);

  const demoPassword = await bcrypt.hash('Demo123!', 10);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@wamvideo.com' },
    create: {
      email: 'demo@wamvideo.com',
      password_hash: demoPassword,
      name: 'Usuario Demo',
      status: 'ACTIVE',
      tenant_id: tenantId,
      updated_at: new Date(),
    },
    update: {},
  });
  await ensureUserRole(demo.id, roleIdByName.get(ROLE_NAMES.STANDARD_USER)!, tenantId);
  await ensureDefaultProfile(demo.id, demo.name);
}

async function seedGenres(tenantId: string) {
  const genres = new Map<string, string>();
  for (const name of GENRE_NAMES) {
    const slug = slugify(name);
    const genre = await prisma.genre.upsert({
      where: { tenant_id_slug: { tenant_id: tenantId, slug } },
      create: { tenant_id: tenantId, name, slug },
      update: { name },
    });
    genres.set(name, genre.id);
  }
  return genres;
}

async function seedMovies(tenantId: string, genres: Map<string, string>) {
  for (const movie of MOVIES) {
    const existing = await prisma.movie.findUnique({
      where: { tenant_id_slug: { tenant_id: tenantId, slug: movie.slug } },
    });
    if (existing) {
      continue;
    }

    await prisma.movie.create({
      data: {
        tenant_id: tenantId,
        title: movie.title,
        slug: movie.slug,
        synopsis: movie.synopsis,
        release_year: movie.releaseYear,
        duration_minutes: movie.durationMinutes,
        video_url: movie.videoUrl,
        is_premium: movie.isPremium,
        status: 'PUBLISHED',
        updated_at: new Date(),
        movie_genres: { create: [{ genre_id: genres.get(movie.genre)! }] },
      },
    });
  }
}

async function seedSeries(tenantId: string, genres: Map<string, string>) {
  for (const series of SERIES) {
    let createdSeries = await prisma.series.findUnique({
      where: { tenant_id_slug: { tenant_id: tenantId, slug: series.slug } },
    });

    if (!createdSeries) {
      createdSeries = await prisma.series.create({
        data: {
          tenant_id: tenantId,
          title: series.title,
          slug: series.slug,
          synopsis: series.synopsis,
          is_premium: series.isPremium,
          status: 'PUBLISHED',
          updated_at: new Date(),
          series_genres: { create: [{ genre_id: genres.get(series.genre)! }] },
        },
      });
    }

    const season = await prisma.season.upsert({
      where: { series_id_number: { series_id: createdSeries.id, number: 1 } },
      create: { series_id: createdSeries.id, number: 1, title: 'Temporada 1' },
      update: {},
    });

    for (const [index, episode] of series.episodes.entries()) {
      const number = index + 1;
      await prisma.episode.upsert({
        where: { season_id_number: { season_id: season.id, number } },
        create: {
          season_id: season.id,
          number,
          title: episode.title,
          synopsis: episode.synopsis,
          duration_minutes: episode.durationMinutes,
          video_url: number % 2 === 0 ? SAMPLE_HLS.sintel : SAMPLE_HLS.bigBuckBunny,
        },
        update: {},
      });
    }
  }
}

async function seedPlans(tenantId: string) {
  const plans: { name: string; description: string; price: number; billing_interval: 'MONTHLY' | 'YEARLY'; max_profiles: number; video_quality: string }[] = [
    { name: 'Gratis', description: 'Plan gratuito con anuncios', price: 0, billing_interval: 'MONTHLY', max_profiles: 1, video_quality: 'SD' },
    { name: 'Premium', description: 'Acceso completo sin anuncios', price: 9.99, billing_interval: 'MONTHLY', max_profiles: 4, video_quality: '4K' },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { tenant_id: tenantId, name: plan.name } });
    if (existing) {
      await prisma.plan.update({ where: { id: existing.id }, data: { ...plan, tenant_id: tenantId } });
    } else {
      await prisma.plan.create({ data: { ...plan, tenant_id: tenantId } });
    }
  }
}

async function seedChannels(tenantId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  for (const channel of CHANNELS) {
    const createdChannel = await prisma.channel.upsert({
      where: { tenant_id_slug: { tenant_id: tenantId, slug: channel.slug } },
      create: {
        tenant_id: tenantId,
        name: channel.name,
        slug: channel.slug,
        category: channel.category,
        is_premium: channel.isPremium,
        stream_url: SAMPLE_HLS.bigBuckBunny,
      },
      update: { category: channel.category, is_premium: channel.isPremium },
    });

    for (const [index, title] of channel.programs.entries()) {
      const start_time = new Date(startOfDay.getTime() + index * PROGRAM_BLOCK_MINUTES * 60_000);
      const end_time = new Date(start_time.getTime() + PROGRAM_BLOCK_MINUTES * 60_000);

      const existing = await prisma.epgProgram.findFirst({
        where: { channel_id: createdChannel.id, start_time },
      });

      if (existing) {
        await prisma.epgProgram.update({
          where: { id: existing.id },
          data: { title, description: channel.synopsis(title), end_time },
        });
      } else {
        await prisma.epgProgram.create({
          data: {
            channel_id: createdChannel.id,
            title,
            description: channel.synopsis(title),
            start_time,
            end_time,
          },
        });
      }
    }
  }
}

async function main() {
  const tenant = await seedTenant();
  const roleIdByName = await seedRolesAndPermissions();
  await linkExistingUsers(roleIdByName);
  await seedDemoUsers(tenant.id, roleIdByName);

  const genres = await seedGenres(tenant.id);
  await seedMovies(tenant.id, genres);
  await seedSeries(tenant.id, genres);
  await seedPlans(tenant.id);
  await seedChannels(tenant.id);

  // eslint-disable-next-line no-console
  console.log(
    `Seed completado: ${MOVIES.length} películas, ${SERIES.length} series, ${CHANNELS.length} canales.`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
