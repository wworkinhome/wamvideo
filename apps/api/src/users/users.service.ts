import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pickPrimaryRole } from '../common/constants';

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

  private toSafeUser(user: {
    password_hash: string;
    user_roles: { roles: { name: string } }[];
    [key: string]: unknown;
  }) {
    const roleNames = user.user_roles.map((userRole) => userRole.roles.name);
    const { password_hash: _passwordHash, user_roles: _userRoles, ...safeUser } = user;
    return { ...safeUser, role: pickPrimaryRole(roleNames), roles: roleNames };
  }
}
