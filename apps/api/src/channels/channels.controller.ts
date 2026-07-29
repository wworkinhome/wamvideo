import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ListChannelsDto } from './dto/list-channels.dto';
import { ImportChannelsDto } from './dto/import-channels.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AccessService } from '../access/access.service';
import { CONTENT_MANAGER_ROLES } from '../common/constants';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly accessService: AccessService,
  ) {}

  @Get()
  findAll(@Query() query: ListChannelsDto) {
    return this.channelsService.findAll(query);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  async findOne(@Param('slug') slug: string, @CurrentUser() user: { id: string; roles: string[] } | null) {
    const channel = await this.channelsService.findBySlug(slug);

    if (!channel.isPremium) {
      return { ...channel, locked: false };
    }

    const unlocked = await this.accessService.hasPremiumAccess(user);
    return { ...channel, streamUrl: unlocked ? channel.streamUrl : null, locked: !unlocked };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Post()
  create(@Body() dto: CreateChannelDto, @CurrentUser() user: AuthenticatedUser) {
    return this.channelsService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Post('import')
  importFromM3U(@Body() dto: ImportChannelsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.channelsService.importFromM3U(dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChannelDto, @CurrentUser() user: AuthenticatedUser) {
    return this.channelsService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.channelsService.remove(id, user);
  }
}
