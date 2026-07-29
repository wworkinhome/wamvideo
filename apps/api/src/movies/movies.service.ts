import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { TenantAccessService } from '../common/tenant-access.service';
import { resolveTargetTenantId } from '../common/tenant-resolution.util';
import { CONTENT_MANAGER_ROLES } from '../common/constants';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

const MOVIE_INCLUDE = { movie_genres: { include: { genres: true } } } as const;

type MovieWithGenres = {
  movie_genres: { genres: { id: string; name: string } }[];
  tenant_id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  release_year: number | null;
  duration_minutes: number | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  video_url: string | null;
  is_premium: boolean;
  is_kids: boolean;
  [key: string]: unknown;
};

@Injectable()
export class MoviesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly tenantAccess: TenantAccessService,
  ) {}

  async findAll() {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const movies = await this.prisma.movie.findMany({
      where: { tenant_id, status: 'PUBLISHED' },
      include: MOVIE_INCLUDE,
      orderBy: { created_at: 'desc' },
    });
    return movies.map((movie) => this.toResponse(movie));
  }

  async findBySlug(slug: string) {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const movie = await this.prisma.movie.findUnique({
      where: { tenant_id_slug: { tenant_id, slug } },
      include: MOVIE_INCLUDE,
    });
    if (!movie) {
      throw new NotFoundException('Película no encontrada');
    }
    return this.toResponse(movie);
  }

  async create(dto: CreateMovieDto, user: AuthenticatedUser) {
    const tenant_id = await resolveTargetTenantId(this.tenantContext, user, dto.tenantId);
    this.tenantAccess.assertHasTenantPermission(user, tenant_id, CONTENT_MANAGER_ROLES);

    const { genreIds, isPremium, releaseYear, durationMinutes, posterUrl, backdropUrl, trailerUrl, videoUrl, title, slug, synopsis } = dto;
    const movie = await this.prisma.movie.create({
      data: {
        tenant_id,
        title,
        slug,
        synopsis,
        release_year: releaseYear,
        duration_minutes: durationMinutes,
        poster_url: posterUrl,
        backdrop_url: backdropUrl,
        trailer_url: trailerUrl,
        video_url: videoUrl,
        is_premium: isPremium ?? false,
        status: 'PUBLISHED',
        updated_at: new Date(),
        movie_genres: genreIds ? { create: genreIds.map((genre_id) => ({ genre_id })) } : undefined,
      },
      include: MOVIE_INCLUDE,
    });
    return this.toResponse(movie);
  }

  async update(id: string, dto: UpdateMovieDto, user: AuthenticatedUser) {
    const existing = await this.ensureExists(id);
    this.tenantAccess.assertHasTenantPermission(user, existing.tenant_id, CONTENT_MANAGER_ROLES);

    const { genreIds, isPremium, releaseYear, durationMinutes, posterUrl, backdropUrl, trailerUrl, videoUrl, title, slug, synopsis } = dto;
    const movie = await this.prisma.movie.update({
      where: { id },
      data: {
        title,
        slug,
        synopsis,
        ...(releaseYear !== undefined ? { release_year: releaseYear } : {}),
        ...(durationMinutes !== undefined ? { duration_minutes: durationMinutes } : {}),
        ...(posterUrl !== undefined ? { poster_url: posterUrl } : {}),
        ...(backdropUrl !== undefined ? { backdrop_url: backdropUrl } : {}),
        ...(trailerUrl !== undefined ? { trailer_url: trailerUrl } : {}),
        ...(videoUrl !== undefined ? { video_url: videoUrl } : {}),
        ...(isPremium !== undefined ? { is_premium: isPremium } : {}),
        updated_at: new Date(),
        movie_genres: genreIds
          ? { deleteMany: {}, create: genreIds.map((genre_id) => ({ genre_id })) }
          : undefined,
      },
      include: MOVIE_INCLUDE,
    });
    return this.toResponse(movie);
  }

  async remove(id: string, user: AuthenticatedUser) {
    const existing = await this.ensureExists(id);
    this.tenantAccess.assertHasTenantPermission(user, existing.tenant_id, CONTENT_MANAGER_ROLES);
    return this.prisma.movie.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      throw new NotFoundException('Película no encontrada');
    }
    return movie;
  }

  private toResponse(movie: MovieWithGenres) {
    const {
      movie_genres,
      tenant_id: _tenant_id,
      status: _status,
      created_at: _created_at,
      updated_at: _updated_at,
      release_year,
      duration_minutes,
      poster_url,
      backdrop_url,
      trailer_url,
      video_url,
      is_premium,
      is_kids: _is_kids,
      ...rest
    } = movie;
    return {
      ...rest,
      releaseYear: release_year,
      durationMinutes: duration_minutes,
      posterUrl: poster_url,
      backdropUrl: backdrop_url,
      trailerUrl: trailer_url,
      videoUrl: video_url,
      isPremium: is_premium,
      genres: movie_genres.map((mg) => ({ id: mg.genres.id, name: mg.genres.name })),
    };
  }
}
