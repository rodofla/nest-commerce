import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role display name',
    example: 'Product Manager',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @Length(3, 50)
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Unique role code (uppercase, letters, numbers, underscores)',
    example: 'PRODUCT_MANAGER',
    minLength: 3,
    maxLength: 100,
    pattern: '^[A-Z_][A-Z0-9_]*$',
  })
  @IsString()
  @Length(3, 100)
  @Matches(/^[A-Z_][A-Z0-9_]*$/, {
    message: 'Code must be uppercase letters, numbers and underscores only',
  })
  @Transform(({ value }: { value: string }) => value?.toUpperCase().trim())
  code: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Manages product catalog and inventory',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the role is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Array of permission IDs to assign to this role',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];

  @ApiPropertyOptional({
    description: 'Role priority level (higher number = higher priority)',
    example: 50,
    default: 50,
  })
  @IsOptional()
  priority?: number;
}
