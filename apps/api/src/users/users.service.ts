import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { pickPrimaryRole } from '../common/constants';
import { getOrCreateRole } from '../common/roles.util';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';

const USER_WITH_ROLES_INCLUDE = { user_roles: { include: { roles: true } } } as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      include: USER_WITH_ROLES_INCLUDE,
    });
    return users.map((user) => this.toSafeUser(user));
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: USER_WITH_ROLES_INCLUDE,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.toSafeUser(user);
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    await this.ensureExists(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status, updated_at: new Date() },
      include: USER_WITH_ROLES_INCLUDE,
    });
    return this.toSafeUser(user);
  }

  // Reemplaza por completo el conjunto de roles del usuario (no acumula).
  async updateRoles(id: string, dto: UpdateUserRolesDto) {
    await this.ensureExists(id);

    await this.prisma.user_roles.deleteMany({ where: { user_id: id } });

    for (const roleName of dto.roles) {
      const role = await getOrCreateRole(this.prisma, roleName);
      await this.prisma.user_roles.create({
        data: { id: randomUUID(), user_id: id, role_id: role.id, tenant_id: null },
      });
    }

    return this.findById(id);
  }

  private async ensureExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  private toSafeUser(user: {
    password_hash: string;
    user_roles: { roles: { name: string } }[];
    [key: string]: unknown;
  }) {
    const roleNames = [...new Set(user.user_roles.map((userRole) => userRole.roles.name))];
    const { password_hash: _passwordHash, user_roles: _userRoles, ...safeUser } = user;
    return { ...safeUser, role: pickPrimaryRole(roleNames), roles: roleNames };
  }
}
