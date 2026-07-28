import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { DEFAULT_TENANT_SLUG, pickPrimaryRole, ROLE_NAMES } from '../common/constants';
import { getOrCreateRole } from '../common/roles.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { slug: DEFAULT_TENANT_SLUG } });
    const password_hash = await bcrypt.hash(dto.password, 10);

    const now = new Date();
    const user = await this.prisma.user.create({
      data: tenant
        ? { email: dto.email, password_hash, name: dto.name, status: 'ACTIVE', tenant_id: tenant.id, updated_at: now }
        : { email: dto.email, password_hash, name: dto.name, status: 'ACTIVE', updated_at: now },
    });

    const freeRole = await getOrCreateRole(this.prisma, ROLE_NAMES.FREE_USER);
    await this.prisma.user_roles.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        role_id: freeRole.id,
        tenant_id: tenant?.id,
      },
    });

    await this.prisma.profiles.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        name: dto.name,
      },
    });

    return this.buildAuthResponse(user, [ROLE_NAMES.FREE_USER]);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const roleNames = await this.getRoleNamesForUser(user.id);
    return this.buildAuthResponse(user, roleNames);
  }

  private async getRoleNamesForUser(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.user_roles.findMany({
      where: { user_id: userId },
      include: { roles: true },
    });
    return [...new Set(userRoles.map((userRole) => userRole.roles.name))];
  }

  private buildAuthResponse(
    user: { id: string; email: string; name: string; password_hash: string },
    roleNames: string[],
  ) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'change-me-access-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    });

    const { password_hash: _passwordHash, ...safeUser } = user;
    return {
      accessToken,
      user: { ...safeUser, role: pickPrimaryRole(roleNames), roles: roleNames },
    };
  }
}
