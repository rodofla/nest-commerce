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

export class CreateRoleDto {
  @IsString()
  @Length(3, 50)
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @IsString()
  @Length(3, 100)
  @Matches(/^[A-Z_][A-Z0-9_]*$/, {
    message: 'Code must be uppercase letters, numbers and underscores only',
  })
  @Transform(({ value }: { value: string }) => value?.toUpperCase().trim())
  code: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];

  @IsOptional()
  priority?: number;
}
