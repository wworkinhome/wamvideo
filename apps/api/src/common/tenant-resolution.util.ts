import { TenantContextService } from './tenant-context.service';

// Resuelve a qué tenant pertenece una mutación de catálogo (crear película/serie/canal/
// género): usa el tenantId explícito del DTO si vino (típicamente un ROOT/SUPER_ADMIN
// gestionando otro tenant), si no el tenant "de casa" del usuario, y como último recurso
// el tenant por defecto de la app (compatibilidad con el admin de un solo tenant).
export async function resolveTargetTenantId(
  tenantContext: TenantContextService,
  user: { tenant_id?: string | null } | null | undefined,
  explicitTenantId?: string,
): Promise<string> {
  if (explicitTenantId) {
    return explicitTenantId;
  }
  if (user?.tenant_id) {
    return user.tenant_id;
  }
  return tenantContext.getDefaultTenantId();
}
