import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { UpsertWatchHistoryDto } from './dto/upsert-watch-history.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('watch-history')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }, @Query('profileId') profileId?: string) {
    return this.watchHistoryService.findAllForUser(user.id, profileId);
  }

  @Get('continue-watching')
  findContinueWatching(@CurrentUser() user: { id: string }, @Query('profileId') profileId?: string) {
    return this.watchHistoryService.findContinueWatching(user.id, profileId);
  }

  @Put()
  upsert(
    @CurrentUser() user: { id: string },
    @Body() dto: UpsertWatchHistoryDto,
    @Query('profileId') profileId?: string,
  ) {
    return this.watchHistoryService.upsert(user.id, dto, profileId);
  }
}
