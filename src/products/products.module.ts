import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductImage } from './entities/';
import { FilesModule } from '../files/files.module';
import { ProductImageService } from './services/product-image.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductImageService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    FilesModule, // Importar FilesModule para usar FilesService
  ],
  exports: [ProductsService, ProductImageService, TypeOrmModule],
})
export class ProductsModule {}
