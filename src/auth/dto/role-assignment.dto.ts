import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @ApiProperty({
    description: 'Array of role IDs to assign',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}

export class RemoveRolesDto {
  @ApiProperty({
    description: 'Array of role IDs to remove',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}

export class AssignPermissionsToRoleDto {
  @ApiProperty({
    description: 'Array of permission IDs to assign to the role',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}

export class RemovePermissionsFromRoleDto {
  @ApiProperty({
    description: 'Array of permission IDs to remove from the role',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
