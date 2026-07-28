import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileContextService } from '../common/profile-context.service';
import { UpsertWatchHistoryDto } from './dto/upsert-watch-history.dto';

@Injectable()
export class WatchHistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileContext: ProfileContextService,
  ) {}

  async findAllForUser(userId: string) {
    const profile_id = await this.profileContext.getOrCreateDefaultProfileId(userId);
    return this.prisma.watchHistory.findMany({
      where: { profile_id },
      include: { movies: true, episodes: true },
      orderBy: { updated_at: 'desc' },
    });
  }

  async upsert(userId: string, dto: UpsertWatchHistoryDto) {
    const { movieId, episodeId, progressSeconds, durationSeconds, completed } = dto;

    if (!movieId && !episodeId) {
      throw new BadRequestException('Debe indicar movieId o episodeId');
    }

    const profile_id = await this.profileContext.getOrCreateDefaultProfileId(userId);

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
