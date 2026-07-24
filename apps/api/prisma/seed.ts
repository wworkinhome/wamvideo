import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Streams HLS públicos de referencia, usados solo como datos de ejemplo
// para el reproductor en desarrollo (no son contenido propio de WAMVIDEO).
const SAMPLE_HLS = {
  bigBuckBunny: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  sintel: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
};

const GENRE_NAMES = ['Acción', 'Drama', 'Comedia', 'Ciencia Ficción', 'Documental'] as const;

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

async function main() {
  const genres = new Map<string, string>();
  for (const name of GENRE_NAMES) {
    const genre = await prisma.genre.upsert({ where: { name }, create: { name }, update: {} });
    genres.set(name, genre.id);
  }

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'root@wamvideo.com' },
    create: {
      email: 'root@wamvideo.com',
      passwordHash: adminPassword,
      name: 'Root WAMVIDEO',
      role: Role.ROOT,
    },
    update: {},
  });

  const demoPassword = await bcrypt.hash('Demo123!', 10);
  await prisma.user.upsert({
    where: { email: 'demo@wamvideo.com' },
    create: {
      email: 'demo@wamvideo.com',
      passwordHash: demoPassword,
      name: 'Usuario Demo',
      role: Role.STANDARD_USER,
    },
    update: {},
  });

  for (const movie of MOVIES) {
    await prisma.movie.upsert({
      where: { slug: movie.slug },
      create: {
        title: movie.title,
        slug: movie.slug,
        synopsis: movie.synopsis,
        releaseYear: movie.releaseYear,
        durationMinutes: movie.durationMinutes,
        videoUrl: movie.videoUrl,
        isPremium: movie.isPremium,
        genres: { connect: [{ id: genres.get(movie.genre) }] },
      },
      update: {},
    });
  }

  for (const series of SERIES) {
    const createdSeries = await prisma.series.upsert({
      where: { slug: series.slug },
      create: {
        title: series.title,
        slug: series.slug,
        synopsis: series.synopsis,
        isPremium: series.isPremium,
        genres: { connect: [{ id: genres.get(series.genre) }] },
      },
      update: {},
    });

    const season = await prisma.season.upsert({
      where: { seriesId_number: { seriesId: createdSeries.id, number: 1 } },
      create: { seriesId: createdSeries.id, number: 1, title: 'Temporada 1' },
      update: {},
    });

    for (const [index, episode] of series.episodes.entries()) {
      const number = index + 1;
      await prisma.episode.upsert({
        where: { seasonId_number: { seasonId: season.id, number } },
        create: {
          seasonId: season.id,
          number,
          title: episode.title,
          synopsis: episode.synopsis,
          durationMinutes: episode.durationMinutes,
          videoUrl: number % 2 === 0 ? SAMPLE_HLS.sintel : SAMPLE_HLS.bigBuckBunny,
        },
        update: {},
      });
    }
  }

  await prisma.plan.upsert({
    where: { slug: 'gratis' },
    create: {
      name: 'Gratis',
      slug: 'gratis',
      priceCents: 0,
      maxProfiles: 1,
      maxQuality: 'SD',
    },
    update: {},
  });

  await prisma.plan.upsert({
    where: { slug: 'premium' },
    create: {
      name: 'Premium',
      slug: 'premium',
      priceCents: 999,
      maxProfiles: 4,
      maxQuality: '4K',
    },
    update: {},
  });

  // eslint-disable-next-line no-console
  console.log(`Seed completado: ${MOVIES.length} películas, ${SERIES.length} series.`);
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
