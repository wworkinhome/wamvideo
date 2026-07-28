import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileContextService } from '../common/profile-context.service';
import { ProfilesService } from '../profiles/profiles.service';
import { resolveProfileId } from '../common/profile-resolution.util';
import { UpsertWatchHistoryDto } from './dto/upsert-watch-history.dto';

const CONTINUE_WATCHING_INCLUDE = {
  movies: true,
  episodes: { include: { seasons: { include: { series: true } } } },
} as const;

@Injectable()
export class WatchHistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileContext: ProfileContextService,
    private readonly profilesService: ProfilesService,
  ) {}

  async findAllForUser(userId: string, profileId?: string) {
    const profile_id = await resolveProfileId(this.profilesService, this.profileContext, userId, profileId);
    return this.prisma.watchHistory.findMany({
      where: { profile_id },
      include: { movies: true, episodes: true },
      orderBy: { updated_at: 'desc' },
    });
  }

  async findContinueWatching(userId: string, profileId?: string) {
    const profile_id = await resolveProfileId(this.profilesService, this.profileContext, userId, profileId);
    const entries = await this.prisma.watchHistory.findMany({
      where: { profile_id, completed: false },
      include: CONTINUE_WATCHING_INCLUDE,
      orderBy: { updated_at: 'desc' },
      take: 20,
    });

    return entries
      .map((entry) => {
        if (entry.movies) {
          const movie = entry.movies;
          return {
            id: entry.id,
            kind: 'movie' as const,
            title: movie.title,
            image: movie.backdrop_url ?? movie.poster_url,
            href: `/pelicula/${movie.slug}`,
            isPremium: movie.is_premium,
            progressSeconds: entry.progress_seconds,
            durationSeconds: entry.duration_seconds,
          };
        }
        if (entry.episodes) {
          const episode = entry.episodes;
          const series = episode.seasons.series;
          return {
            id: entry.id,
            kind: 'episode' as const,
            title: `${series.title} · T${episode.seasons.number} E${episode.number}`,
            image: series.backdrop_url ?? series.poster_url,
            href: `/serie/${series.slug}`,
            isPremium: series.is_premium,
            progressSeconds: entry.progress_seconds,
            durationSeconds: entry.duration_seconds,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  async upsert(userId: string, dto: UpsertWatchHistoryDto, profileId?: string) {
    const { movieId, episodeId, progressSeconds, durationSeconds, completed } = dto;

    if (!movieId && !episodeId) {
      throw new BadRequestException('Debe indicar movieId o episodeId');
    }

    const profile_id = await resolveProfileId(this.profilesService, this.profileContext, userId, profileId);

    // The compound unique on (profile_id, movie_id, episode_id) doesn't dedupe reliably
    // when one of movie_id/episode_id is NULL (NULL <> NULL in Postgres), so look the
    // existing row up manually instead of relying on Prisma's upsert().
    const existing = await this.prisma.watchHistory.findFirst({
      where: movieId ? { profile_id, movie_id: movieId } : { profile_id, episode_id: episodeId },
    });

    const data = {
      progress_seconds: progressSeconds,
      duration_seconds: durationSeconds,
      completed: completed ?? false,
      updated_at: new Date(),
    };

    if (existing) {
      return this.prisma.watchHistory.update({ where: { id: existing.id }, data });
    }

    return this.prisma.watchHistory.create({
      data: { profile_id, movie_id: movieId ?? null, episode_id: episodeId ?? null, ...data },
    });
  }
}
