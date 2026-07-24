import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Streams HLS públicos de referencia, usados solo como datos de ejemplo
// para el reproductor en desarrollo (no son contenido propio de WAMVIDEO).
const SAMPLE_HLS = {
  bigBuckBunny:
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  sintel: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
};

async function main() {
  const genres = await Promise.all(
    ['Acción', 'Drama', 'Comedia', 'Ciencia Ficción', 'Documental'].map((name) =>
      prisma.genre.upsert({ where: { name }, create: { name }, update: {} }),
    ),
  );

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

  await prisma.movie.upsert({
    where: { slug: 'big-buck-bunny' },
    create: {
      title: 'Big Buck Bunny',
      slug: 'big-buck-bunny',
      synopsis:
        'Un conejo gigante y bondadoso es provocado por tres roedores traviesos y decide vengarse.',
      releaseYear: 2008,
      durationMinutes: 10,
      posterUrl: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
      videoUrl: SAMPLE_HLS.bigBuckBunny,
      isPremium: false,
      genres: { connect: [{ id: genres[2].id }] },
    },
    update: {},
  });

  await prisma.movie.upsert({
    where: { slug: 'sintel' },
    create: {
      title: 'Sintel',
      slug: 'sintel',
      synopsis:
        'Una joven llamada Sintel busca a un pequeño dragón al que crió y con el que forjó un vínculo especial.',
      releaseYear: 2010,
      durationMinutes: 15,
      posterUrl: 'https://durian.blender.org/wp-content/uploads/2010/06/sintel_poster.jpg',
      videoUrl: SAMPLE_HLS.sintel,
      isPremium: true,
      genres: { connect: [{ id: genres[3].id }] },
    },
    update: {},
  });

  const series = await prisma.series.upsert({
    where: { slug: 'wamvideo-originals' },
    create: {
      title: 'WAMVIDEO Originals',
      slug: 'wamvideo-originals',
      synopsis: 'Serie de demostración con temporadas y episodios de ejemplo.',
      isPremium: false,
      genres: { connect: [{ id: genres[1].id }] },
    },
    update: {},
  });

  const season = await prisma.season.upsert({
    where: { seriesId_number: { seriesId: series.id, number: 1 } },
    create: { seriesId: series.id, number: 1, title: 'Temporada 1' },
    update: {},
  });

  await prisma.episode.upsert({
    where: { seasonId_number: { seasonId: season.id, number: 1 } },
    create: {
      seasonId: season.id,
      number: 1,
      title: 'Episodio 1: El comienzo',
      synopsis: 'Primer episodio de demostración.',
      durationMinutes: 10,
      videoUrl: SAMPLE_HLS.bigBuckBunny,
    },
    update: {},
  });

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
  console.log('Seed completado.');
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
