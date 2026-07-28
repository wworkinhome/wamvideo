import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
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

@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly accessService: AccessService,
  ) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.channelsService.findAll(category);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  async findOne(@Param('slug') slug: string, @CurrentUser() user: { id: string; role: Role } | null) {
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
  create(@Body() dto: CreateChannelDto) {
    return this.channelsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChannelDto) {
    return this.channelsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_MANAGER_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelsService.remove(id);
  }
}
