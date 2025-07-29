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

export class UpdateProductWithImagesDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  sizes?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsIn(['mens', 'womens', 'kid', 'unisex'])
  @IsOptional()
  gender?: string;

  @IsOptional()
  @IsString()
  imageFolder?: string = 'products';

  @IsOptional()
  @IsString()
  imageAction?: 'replace' | 'add' = 'add'; // replace: reemplaza todas, add: agrega nuevas
}
