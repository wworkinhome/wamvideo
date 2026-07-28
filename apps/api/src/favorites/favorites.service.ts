import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileContextService } from '../common/profile-context.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

const FAVORITE_INCLUDE = {
  movies: { include: { movie_genres: { include: { genres: true } } } },
  series: { include: { series_genres: { include: { genres: true } } } },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMovie(movie: any) {
  const { movie_genres, tenant_id, status, created_at, updated_at, release_year, duration_minutes, poster_url, backdrop_url, trailer_url, video_url, is_premium, is_kids, ...rest } = movie;
  return {
    ...rest,
    releaseYear: release_year,
    durationMinutes: duration_minutes,
    posterUrl: poster_url,
    backdropUrl: backdrop_url,
    trailerUrl: trailer_url,
    videoUrl: video_url,
    isPremium: is_premium,
    genres: movie_genres.map((mg: any) => ({ id: mg.genres.id, name: mg.genres.name })),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSeries(series: any) {
  const { series_genres, tenant_id, status, created_at, updated_at, poster_url, backdrop_url, is_premium, is_kids, ...rest } = series;
  return {
    ...rest,
    posterUrl: poster_url,
    backdropUrl: backdrop_url,
    isPremium: is_premium,
    genres: series_genres.map((sg: any) => ({ id: sg.genres.id, name: sg.genres.name })),
  };
}

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileContext: ProfileContextService,
  ) {}

  async findAllForUser(userId: string) {
    const profile_id = await this.profileContext.getOrCreateDefaultProfileId(userId);
    const favorites = await this.prisma.favorite.findMany({
      where: { profile_id },
      include: FAVORITE_INCLUDE,
      orderBy: { created_at: 'desc' },
    });
    return favorites.map((favorite) => this.toResponse(favorite));
  }

  async create(userId: string, dto: CreateFavoriteDto) {
    if (!dto.movieId && !dto.seriesId) {
      throw new BadRequestException('Debe indicar movieId o seriesId');
    }

    const profile_id = await this.profileContext.getOrCreateDefaultProfileId(userId);
    const favorite = await this.prisma.favorite.create({
      data: { profile_id, movie_id: dto.movieId, series_id: dto.seriesId },
      include: FAVORITE_INCLUDE,
    });
    return this.toResponse(favorite);
  }

  async remove(userId: string, id: string) {
    const profile_id = await this.profileContext.getOrCreateDefaultProfileId(userId);
    return this.prisma.favorite.deleteMany({ where: { id, profile_id } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toResponse(favorite: any) {
    const { movies, series, profile_id, movie_id, series_id, ...rest } = favorite;
    return {
      ...rest,
      movie: movies ? mapMovie(movies) : null,
      series: series ? mapSeries(series) : null,
    };
  }
}
