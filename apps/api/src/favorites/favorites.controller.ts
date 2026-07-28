import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }, @Query('profileId') profileId?: string) {
    return this.favoritesService.findAllForUser(user.id, profileId);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateFavoriteDto,
    @Query('profileId') profileId?: string,
  ) {
    return this.favoritesService.create(user.id, dto, profileId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string, @Query('profileId') profileId?: string) {
    return this.favoritesService.remove(user.id, id, profileId);
  }
}
