import { Type } from 'class-transformer';
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

export class CreateProductWithImagesDto {
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
  @Type(() => Number)
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

  @ApiPropertyOptional({
    description: 'Folder name for image storage',
    example: 'products',
    default: 'products',
  })
  @IsOptional()
  @IsString()
  imageFolder?: string = 'products';

  @ApiPropertyOptional({
    description:
      'Image files to upload with the product (max 10 files, 2MB each)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsOptional()
  @IsArray()
  files?: Express.Multer.File[];
}
