import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionAction, PermissionResource } from '../entities';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission display name',
    example: 'Create Product',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @Length(3, 100)
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @ApiProperty({
    description:
      'Unique permission code (uppercase, letters, numbers, underscores)',
    example: 'PRODUCT_CREATE',
    minLength: 3,
    maxLength: 50,
    pattern: '^[A-Z_][A-Z0-9_]*$',
  })
  @IsString()
  @Length(3, 50)
  @Matches(/^[A-Z_][A-Z0-9_]*$/, {
    message: 'Code must be uppercase letters, numbers and underscores only',
  })
  @Transform(({ value }: { value: string }) => value?.toUpperCase().trim())
  code: string;

  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'Allows creating new products in the catalog',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({
    description: 'Resource that this permission applies to',
    enum: PermissionResource,
    example: PermissionResource.PRODUCT,
  })
  @IsEnum(PermissionResource)
  resource: PermissionResource;

  @ApiProperty({
    description: 'Action that this permission allows',
    enum: PermissionAction,
    example: PermissionAction.CREATE,
  })
  @IsEnum(PermissionAction)
  action: PermissionAction;

  @ApiPropertyOptional({
    description: 'Whether the permission is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
