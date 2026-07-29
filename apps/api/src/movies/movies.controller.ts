import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AccessService } from '../access/access.service';
import { CONTENT_MANAGER_ROLES } from '../common/constants';
import { AuthenticatedUser } from '../auth/jwt.strategy';

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
  async findOne(@Param('slug') slug: string, @CurrentUser() user: { id: string; roles: string[] } | null) {
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
  create(@Body() dto: CreateMovieDto, @CurrentUser() user: AuthenticatedUser) {
    return this.moviesService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMovieDto, @CurrentUser() user: AuthenticatedUser) {
    return this.moviesService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.moviesService.remove(id, user);
  }
}
