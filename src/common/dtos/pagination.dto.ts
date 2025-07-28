import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number) // enableImplicitConversion: true
  offset?: number;

  @IsOptional()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  limit?: number;
}
