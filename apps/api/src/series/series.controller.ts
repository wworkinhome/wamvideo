import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SeriesService } from './series.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AccessService } from '../access/access.service';
import { CONTENT_MANAGER_ROLES } from '../common/constants';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('series')
export class SeriesController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly accessService: AccessService,
  ) {}

  @Get()
  findAll() {
    return this.seriesService.findAll();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  async findOne(@Param('slug') slug: string, @CurrentUser() user: { id: string; roles: string[] } | null) {
    const series = await this.seriesService.findBySlug(slug);

    if (!series.isPremium) {
      return { ...series, locked: false };
    }

    const unlocked = await this.accessService.hasPremiumAccess(user);
    if (unlocked) {
      return { ...series, locked: false };
    }

    return {
      ...series,
      locked: true,
      seasons: series.seasons!.map((season) => ({
        ...season,
        episodes: season.episodes.map((episode) => ({ ...episode, videoUrl: null })),
      })),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Post()
  create(@Body() dto: CreateSeriesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.seriesService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSeriesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.seriesService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.seriesService.remove(id, user);
  }
}
