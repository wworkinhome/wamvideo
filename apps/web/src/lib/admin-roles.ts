// Espejo de CONTENT_MANAGER_ROLES/GLOBAL_ADMIN_ROLES del backend (apps/api/src/common/constants.ts),
// usado solo para decidir qué mostrar/ocultar en el panel — la autorización real vive en la API.
export const CONTENT_MANAGER_ROLES = ['ROOT', 'SUPER_ADMIN', 'ADMIN_GENERAL', 'ADMIN_TENANT', 'EDITOR', 'PRODUCER'];
export const GLOBAL_ADMIN_ROLES = ['ROOT', 'SUPER_ADMIN'];

export const ALL_ROLE_NAMES = [
  'ROOT',
  'SUPER_ADMIN',
  'ADMIN_GENERAL',
  'ADMIN_TENANT',
  'EDITOR',
  'PRODUCER',
  'MODERATOR',
  'SUPPORT',
  'ANALYST',
  'PREMIUM_USER',
  'STANDARD_USER',
  'FREE_USER',
  'GUEST',
];

export function hasAnyRole(userRoles: string[] | undefined, allowed: string[]): boolean {
  if (!userRoles) return false;
  return userRoles.some((r) => allowed.includes(r));
}
