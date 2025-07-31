import { IsArray, IsUUID } from 'class-validator';

export class AssignRolesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}

export class RemoveRolesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}

export class AssignPermissionsToRoleDto {
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}

export class RemovePermissionsFromRoleDto {
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
