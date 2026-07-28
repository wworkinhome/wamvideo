import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileContextService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns the user's oldest profile, creating a default one on the fly for accounts that predate profiles. */
  async getOrCreateDefaultProfileId(userId: string): Promise<string> {
    const existing = await this.prisma.profiles.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' },
    });
    if (existing) {
      return existing.id;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const profile = await this.prisma.profiles.create({
      data: { id: randomUUID(), user_id: userId, name: user?.name ?? 'Principal' },
    });
    return profile.id;
  }
}
