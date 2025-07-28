import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadProductImagesDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsString()
  folder?: string = 'products';
}
