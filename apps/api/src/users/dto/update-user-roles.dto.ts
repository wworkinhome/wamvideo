import { IsArray, IsIn } from 'class-validator';
import { ROLE_NAMES } from '../../common/constants';

const ROLE_VALUES = Object.values(ROLE_NAMES);

export class UpdateUserRolesDto {
  @IsArray()
  @IsIn(ROLE_VALUES, { each: true })
  roles: string[];
}
