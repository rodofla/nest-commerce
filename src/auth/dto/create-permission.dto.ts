import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PermissionAction, PermissionResource } from '../entities';

export class CreatePermissionDto {
  @IsString()
  @Length(3, 100)
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @IsString()
  @Length(3, 50)
  @Matches(/^[A-Z_][A-Z0-9_]*$/, {
    message: 'Code must be uppercase letters, numbers and underscores only',
  })
  @Transform(({ value }: { value: string }) => value?.toUpperCase().trim())
  code: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsEnum(PermissionResource)
  resource: PermissionResource;

  @IsEnum(PermissionAction)
  action: PermissionAction;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
