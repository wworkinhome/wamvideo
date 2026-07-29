import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { ROLE_NAMES } from '../../common/constants';

const ROLE_VALUES = Object.values(ROLE_NAMES);

export class UpdateUserRolesDto {
  @IsArray()
  @IsIn(ROLE_VALUES, { each: true })
  roles: string[];

  // Si se indica, los roles se asignan solo dentro de ese tenant (no tocan roles
  // globales ni los de otros tenants). Si se omite, se reemplazan los roles globales.
  @IsOptional()
  @IsString()
  tenantId?: string;
}
