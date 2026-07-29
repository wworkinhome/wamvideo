import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Injectable()
export class TenantAccessService {
  // Aprueba si el usuario tiene alguno de allowedRoles GLOBALMENTE (user_roles.tenant_id
  // NULL — típicamente ROOT/SUPER_ADMIN) o ESPECÍFICAMENTE dentro de tenantId. Rechaza si
  // solo tiene ese rol en otro tenant — así se corta la fuga de "content.manage en el
  // tenant A también sirve para tocar contenido del tenant B".
  assertHasTenantPermission(
    user: Pick<AuthenticatedUser, 'globalRoles' | 'tenantRoles'> | null | undefined,
    tenantId: string,
    allowedRoles: string[],
  ): void {
    if (!user) {
      throw new ForbiddenException('No autenticado');
    }
    if (user.globalRoles?.some((role) => allowedRoles.includes(role))) {
      return;
    }
    if (user.tenantRoles?.[tenantId]?.some((role) => allowedRoles.includes(role))) {
      return;
    }
    throw new ForbiddenException('No tienes permiso sobre este tenant');
  }
}
