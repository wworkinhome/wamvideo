import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AccessService } from '../access/access.service';

const CONTENT_MANAGER_ROLES = [
  Role.ROOT,
  Role.SUPER_ADMIN,
  Role.ADMIN_GENERAL,
  Role.ADMIN_TENANT,
  Role.EDITOR,
  Role.PRODUCER,
];

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly accessService: AccessService,
  ) {}

  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  async findOne(@Param('slug') slug: string, @CurrentUser() user: { id: string; role: Role } | null) {
    const movie = await this.moviesService.findBySlug(slug);

    if (!movie.isPremium) {
      return { ...movie, locked: false };
    }

    const unlocked = await this.accessService.hasPremiumAccess(user);
    return { ...movie, videoUrl: unlocked ? movie.videoUrl : null, locked: !unlocked };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Post()
  create(@Body() dto: CreateMovieDto) {
    return this.moviesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMovieDto) {
    return this.moviesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(id);
  }
}
