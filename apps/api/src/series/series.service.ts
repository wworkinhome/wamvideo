import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/tenant-context.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';

const SERIES_LIST_INCLUDE = { series_genres: { include: { genres: true } } } as const;
const SERIES_DETAIL_INCLUDE = {
  series_genres: { include: { genres: true } },
  seasons: {
    orderBy: { number: 'asc' as const },
    include: { episodes: { orderBy: { number: 'asc' as const } } },
  },
} as const;

type SeriesWithGenres = {
  series_genres: { genres: { id: string; name: string } }[];
  seasons?: {
    episodes: { video_url: string | null; [key: string]: unknown }[];
    [key: string]: unknown;
  }[];
  tenant_id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  poster_url: string | null;
  backdrop_url: string | null;
  is_premium: boolean;
  is_kids: boolean;
  [key: string]: unknown;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEpisode(episode: any) {
  const { video_url, duration_minutes, season_id, thumbnail_url, air_date, ...rest } = episode;
  return { ...rest, videoUrl: video_url, durationMinutes: duration_minutes };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSeason(season: any) {
  const { episodes, series_id, ...rest } = season;
  return { ...rest, episodes: episodes.map(mapEpisode) };
}

@Injectable()
export class SeriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll() {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const series = await this.prisma.series.findMany({
      where: { tenant_id, status: 'PUBLISHED' },
      include: SERIES_LIST_INCLUDE,
      orderBy: { created_at: 'desc' },
    });
    return series.map((item) => this.toResponse(item));
  }

  async findBySlug(slug: string) {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const series = await this.prisma.series.findUnique({
      where: { tenant_id_slug: { tenant_id, slug } },
      include: SERIES_DETAIL_INCLUDE,
    });
    if (!series) {
      throw new NotFoundException('Serie no encontrada');
    }
    return this.toResponse(series);
  }

  async create(dto: CreateSeriesDto) {
    const tenant_id = await this.tenantContext.getDefaultTenantId();
    const { genreIds, isPremium, posterUrl, backdropUrl, title, slug, synopsis } = dto;
    const series = await this.prisma.series.create({
      data: {
        tenant_id,
        title,
        slug,
        synopsis,
        poster_url: posterUrl,
        backdrop_url: backdropUrl,
        is_premium: isPremium ?? false,
        status: 'PUBLISHED',
        updated_at: new Date(),
        series_genres: genreIds ? { create: genreIds.map((genre_id) => ({ genre_id })) } : undefined,
      },
      include: SERIES_LIST_INCLUDE,
    });
    return this.toResponse(series);
  }

  async update(id: string, dto: UpdateSeriesDto) {
    await this.ensureExists(id);
    const { genreIds, isPremium, posterUrl, backdropUrl, title, slug, synopsis } = dto;
    const series = await this.prisma.series.update({
      where: { id },
      data: {
        title,
        slug,
        synopsis,
        ...(posterUrl !== undefined ? { poster_url: posterUrl } : {}),
        ...(backdropUrl !== undefined ? { backdrop_url: backdropUrl } : {}),
        ...(isPremium !== undefined ? { is_premium: isPremium } : {}),
        updated_at: new Date(),
        series_genres: genreIds
          ? { deleteMany: {}, create: genreIds.map((genre_id) => ({ genre_id })) }
          : undefined,
      },
      include: SERIES_LIST_INCLUDE,
    });
    return this.toResponse(series);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.series.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const series = await this.prisma.series.findUnique({ where: { id } });
    if (!series) {
      throw new NotFoundException('Serie no encontrada');
    }
  }

  private toResponse(series: SeriesWithGenres) {
    const {
      series_genres,
      seasons,
      tenant_id: _tenant_id,
      status: _status,
      created_at: _created_at,
      updated_at: _updated_at,
      poster_url,
      backdrop_url,
      is_premium,
      is_kids: _is_kids,
      ...rest
    } = series;
    return {
      ...rest,
      posterUrl: poster_url,
      backdropUrl: backdrop_url,
      isPremium: is_premium,
      genres: series_genres.map((sg) => ({ id: sg.genres.id, name: sg.genres.name })),
      ...(seasons ? { seasons: seasons.map(mapSeason) } : {}),
    };
  }
}
