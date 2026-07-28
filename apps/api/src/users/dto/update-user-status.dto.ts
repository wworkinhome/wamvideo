import { IsIn } from 'class-validator';

const USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DELETED'] as const;

export class UpdateUserStatusDto {
  @IsIn(USER_STATUSES)
  status: (typeof USER_STATUSES)[number];
}
