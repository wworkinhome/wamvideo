import { ProfileContextService } from './profile-context.service';
import { ProfilesService } from '../profiles/profiles.service';

// Si viene un profileId explícito, verifica que pertenezca al usuario autenticado.
// Si no viene ninguno (llamadas viejas del cliente, o cuentas sin selector de perfil
// todavía), cae al perfil por defecto — mantiene compatibilidad hacia atrás.
export async function resolveProfileId(
  profilesService: ProfilesService,
  profileContext: ProfileContextService,
  userId: string,
  profileId?: string,
): Promise<string> {
  if (profileId) {
    await profilesService.assertOwnership(userId, profileId);
    return profileId;
  }
  return profileContext.getOrCreateDefaultProfileId(userId);
}
