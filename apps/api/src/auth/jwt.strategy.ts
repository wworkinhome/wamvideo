import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { pickPrimaryRole } from '../common/constants';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  tenant_id: string | null;
  role: string;
  roles: string[];
  // Roles sin tenant_id (user_roles.tenant_id IS NULL) — cuentan en cualquier tenant.
  globalRoles: string[];
  // Roles asignados específicamente dentro de un tenant: tenantId -> nombres de rol.
  tenantRoles: Record<string, string[]>;
  [key: string]: unknown;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? 'change-me-access-secret',
    });
  }

  async validate(payload: { sub: string }): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { user_roles: { include: { roles: true } } },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const roleNames = [...new Set(user.user_roles.map((userRole) => userRole.roles.name))];

    const globalRoles = [
      ...new Set(user.user_roles.filter((ur) => !ur.tenant_id).map((ur) => ur.roles.name)),
    ];
    const tenantRoles: Record<string, string[]> = {};
    for (const ur of user.user_roles) {
      if (!ur.tenant_id) continue;
      const bucket = tenantRoles[ur.tenant_id] ?? (tenantRoles[ur.tenant_id] = []);
      if (!bucket.includes(ur.roles.name)) {
        bucket.push(ur.roles.name);
      }
    }

    const { password_hash: _passwordHash, user_roles: _userRoles, ...safeUser } = user;
    return {
      ...safeUser,
      role: pickPrimaryRole(roleNames),
      roles: roleNames,
      globalRoles,
      tenantRoles,
    } as AuthenticatedUser;
  }
}
