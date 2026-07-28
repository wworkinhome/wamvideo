import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    const profiles = await this.prisma.profiles.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' },
    });
    return profiles.map((p) => this.toSafeProfile(p));
  }

  async create(userId: string, dto: CreateProfileDto) {
    const profile = await this.prisma.profiles.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        name: dto.name,
        avatar_url: dto.avatarUrl,
        is_kids: dto.isKids ?? false,
        pin_code: dto.pinCode ? await bcrypt.hash(dto.pinCode, 10) : undefined,
      },
    });
    return this.toSafeProfile(profile);
  }

  async update(userId: string, profileId: string, dto: UpdateProfileDto) {
    await this.assertOwnership(userId, profileId);
    const profile = await this.prisma.profiles.update({
      where: { id: profileId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.avatarUrl !== undefined ? { avatar_url: dto.avatarUrl } : {}),
        ...(dto.isKids !== undefined ? { is_kids: dto.isKids } : {}),
        ...(dto.pinCode !== undefined ? { pin_code: await bcrypt.hash(dto.pinCode, 10) } : {}),
      },
    });
    return this.toSafeProfile(profile);
  }

  async remove(userId: string, profileId: string) {
    await this.assertOwnership(userId, profileId);
    return this.prisma.profiles.delete({ where: { id: profileId } });
  }

  // Usado por Favorites/WatchHistory (y cualquier módulo scoped a Profile) para
  // verificar que el perfil pertenece al usuario autenticado antes de leer/escribir.
  async assertOwnership(userId: string, profileId: string) {
    const profile = await this.prisma.profiles.findUnique({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }
    if (profile.user_id !== userId) {
      throw new ForbiddenException('Este perfil no te pertenece');
    }
    return profile;
  }

  private toSafeProfile(profile: {
    pin_code: string | null;
    avatar_url: string | null;
    is_kids: boolean;
    [key: string]: unknown;
  }) {
    const { pin_code, avatar_url, is_kids, ...rest } = profile;
    return { ...rest, avatarUrl: avatar_url, isKids: is_kids, hasPin: !!pin_code };
  }
}
