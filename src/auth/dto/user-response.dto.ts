import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    description: 'Unique role identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Role display name',
    example: 'Administrator',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Role code identifier',
    example: 'ADMIN',
  })
  @Expose()
  code: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Administrative access to most features',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Role priority level (higher number = higher priority)',
    example: 80,
  })
  @Expose()
  priority: number;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @Expose()
  fullName: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the user email is verified',
    example: true,
  })
  @Expose()
  emailVerified: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2024-01-15T10:30:00Z',
    type: 'string',
    format: 'date-time',
  })
  @Expose()
  lastLoginAt: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'User assigned roles',
    type: [RoleResponseDto],
  })
  @Expose()
  @Type(() => RoleResponseDto)
  roles: RoleResponseDto[];

  @ApiPropertyOptional({
    description: 'JWT access token (only present in login/register responses)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  token?: string; // Optional, as it may not be present in all responses
}
