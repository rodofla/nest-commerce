import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title/name',
    example: 'Premium Cotton T-Shirt',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({
    description: 'Product price in dollars',
    example: 29.99,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality cotton t-shirt with comfortable fit',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Product URL slug (auto-generated if not provided)',
    example: 'premium-cotton-t-shirt',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Available stock quantity',
    example: 100,
    minimum: 0,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({
    description: 'Available sizes',
    example: ['S', 'M', 'L', 'XL'],
    type: [String],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  sizes?: string[];

  @ApiPropertyOptional({
    description: 'Product tags for categorization',
    example: ['cotton', 'casual', 'summer'],
    type: [String],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Target gender/category',
    example: 'unisex',
    enum: ['mens', 'womens', 'kid', 'unisex'],
  })
  @IsIn(['mens', 'womens', 'kid', 'unisex'])
  gender: string;

  // Images are uploaded separately via file upload endpoints
}
