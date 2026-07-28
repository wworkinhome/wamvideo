export const DEFAULT_TENANT_SLUG = 'wamvideo';

export const ROLE_NAMES = {
  ROOT: 'ROOT',
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_GENERAL: 'ADMIN_GENERAL',
  ADMIN_TENANT: 'ADMIN_TENANT',
  EDITOR: 'EDITOR',
  PRODUCER: 'PRODUCER',
  MODERATOR: 'MODERATOR',
  SUPPORT: 'SUPPORT',
  ANALYST: 'ANALYST',
  PREMIUM_USER: 'PREMIUM_USER',
  STANDARD_USER: 'STANDARD_USER',
  FREE_USER: 'FREE_USER',
  GUEST: 'GUEST',
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

/** Roles that can manage catalog content (movies, series, channels). */
export const CONTENT_MANAGER_ROLES: RoleName[] = [
  ROLE_NAMES.ROOT,
  ROLE_NAMES.SUPER_ADMIN,
  ROLE_NAMES.ADMIN_GENERAL,
  ROLE_NAMES.ADMIN_TENANT,
  ROLE_NAMES.EDITOR,
  ROLE_NAMES.PRODUCER,
];

/** Roles that unlock Premium content regardless of subscription status. */
export const STAFF_ROLES: RoleName[] = [
  ROLE_NAMES.ROOT,
  ROLE_NAMES.SUPER_ADMIN,
  ROLE_NAMES.ADMIN_GENERAL,
  ROLE_NAMES.ADMIN_TENANT,
  ROLE_NAMES.EDITOR,
  ROLE_NAMES.PRODUCER,
  ROLE_NAMES.PREMIUM_USER,
];

/** Roles allowed to see/manage every tenant (super-admin style). */
export const GLOBAL_ADMIN_ROLES: RoleName[] = [ROLE_NAMES.ROOT, ROLE_NAMES.SUPER_ADMIN];

/** Most-to-least privileged, used to pick a single display role out of a user's role set. */
const ROLE_PRIORITY: RoleName[] = Object.values(ROLE_NAMES);

/** Picks the most privileged role name out of a user's assigned roles, for display/back-compat. */
export function pickPrimaryRole(roleNames: string[]): RoleName {
  for (const role of ROLE_PRIORITY) {
    if (roleNames.includes(role)) {
      return role;
    }
  }
  return ROLE_NAMES.FREE_USER;
}
