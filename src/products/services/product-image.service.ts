import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductImage } from '../entities';
import { Product } from '../entities/product.entity';
import { FilesService } from '../../files/files.service';
import {
  ImageUploadResult,
  ImageUploadResponse,
  ImageDeleteResponse,
} from '../interfaces/image-response.interface';

@Injectable()
export class ProductImageService {
  private readonly logger = new Logger('ProductImageService');

  constructor(
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly filesService: FilesService,
  ) {}

  async uploadImagesForProduct(
    productId: number,
    files: Express.Multer.File[],
    folder: string = 'products',
  ): Promise<ImageUploadResponse> {
    // Verificar que el producto existe
    const product = await this.productRepository.findOne({
      where: { id: productId.toString() },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const uploadedImages: ProductImage[] = [];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const file of files) {
        // Usar FilesService para subir
        const uploadResult = await this.filesService.uploadProductImage(
          file,
          folder,
        );

        // Crear registro en BD con referencia correcta al producto
        const productImage = this.productImageRepository.create({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          originalName: file.originalname,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          bytes: uploadResult.bytes,
          product: product, // ✅ Referencia tipada correctamente
        });

        const savedImage = await queryRunner.manager.save(productImage);
        uploadedImages.push(savedImage);
      }

      await queryRunner.commitTransaction();

      // Convertir ProductImage[] a ImageUploadResult[]
      const imageResults: ImageUploadResult[] = uploadedImages.map((image) => ({
        id: Number(image.id),
        url: image.url,
        publicId: image.publicId,
        originalName: image.originalName,
        format: image.format,
        width: image.width,
        height: image.height,
        bytes: image.bytes,
      }));

      return {
        message: `Successfully uploaded ${uploadedImages.length} images`,
        images: imageResults,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Limpiar archivos subidos en caso de error
      for (const image of uploadedImages) {
        if (image.publicId) {
          try {
            await this.filesService.deleteProductImage(image.publicId);
          } catch (deleteError) {
            this.logger.error(
              `Failed to cleanup image ${image.publicId}`,
              deleteError,
            );
          }
        }
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteImage(imageId: number): Promise<ImageDeleteResponse> {
    const image = await this.productImageRepository.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    try {
      // Eliminar del servicio externo
      if (image.publicId) {
        await this.filesService.deleteProductImage(image.publicId);
      }

      // Eliminar de BD
      await this.productImageRepository.remove(image);

      return { message: 'Image deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete image ${imageId}`, error);
      throw error;
    }
  }

  async replaceProductImages(
    productId: number,
    files: Express.Multer.File[],
    folder: string = 'products',
  ): Promise<ImageUploadResponse> {
    // Verificar que el producto existe
    const product = await this.productRepository.findOne({
      where: { id: productId.toString() },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Obtener imágenes existentes
      const existingImages = await this.productImageRepository.find({
        where: { product: { id: productId.toString() } },
      });

      // 2. Eliminar imágenes existentes del servicio externo
      for (const image of existingImages) {
        if (image.publicId) {
          await this.filesService.deleteProductImage(image.publicId);
        }
      }

      // 3. Eliminar registros de BD
      await queryRunner.manager.delete(ProductImage, {
        product: { id: productId.toString() },
      });

      // 4. Subir nuevas imágenes
      const newUploadedImages: ProductImage[] = [];
      for (const file of files) {
        const uploadResult = await this.filesService.uploadProductImage(
          file,
          folder,
        );

        const productImage = this.productImageRepository.create({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          originalName: file.originalname,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          bytes: uploadResult.bytes,
          product: product, // ✅ Referencia tipada correctamente
        });

        const savedImage = await queryRunner.manager.save(productImage);
        newUploadedImages.push(savedImage);
      }

      await queryRunner.commitTransaction();

      // Convertir ProductImage[] a ImageUploadResult[]
      const imageResults: ImageUploadResult[] = newUploadedImages.map(
        (image) => ({
          id: Number(image.id),
          url: image.url,
          publicId: image.publicId,
          originalName: image.originalName,
          format: image.format,
          width: image.width,
          height: image.height,
          bytes: image.bytes,
        }),
      );

      return {
        message: `Successfully replaced images with ${newUploadedImages.length} new images`,
        images: imageResults,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
