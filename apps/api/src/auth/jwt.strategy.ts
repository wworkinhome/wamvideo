import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { pickPrimaryRole } from '../common/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? 'change-me-access-secret',
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { user_roles: { include: { roles: true } } },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const roleNames = [...new Set(user.user_roles.map((userRole) => userRole.roles.name))];
    const { password_hash: _passwordHash, user_roles: _userRoles, ...safeUser } = user;
    return { ...safeUser, role: pickPrimaryRole(roleNames), roles: roleNames };
  }
}
