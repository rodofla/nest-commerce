import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductWithImagesDto } from './dto/create-product-with-images.dto';
import { UpdateProductWithImagesDto } from './dto/update-product-with-images.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { isPostgresError } from '../common/utils/postgres-error.util';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as IsUUID } from 'uuid';
import { ProductImage } from './entities';
import { ProductImageService } from './services/product-image.service';
import { UploadProductImagesDto } from './dto/upload-product-images.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
    private readonly productImageService: ProductImageService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return this.findOnePlain(product.id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async createWithImages(
    createProductDto: CreateProductWithImagesDto,
    files?: Express.Multer.File[],
  ) {
    try {
      const { imageFolder = 'products', ...productData } = createProductDto;

      // 1. Crear producto
      const product = this.productRepository.create(productData);
      await this.productRepository.save(product);

      // 2. Subir imágenes si las hay
      if (files && files.length > 0) {
        await this.productImageService.uploadImagesForProduct(
          Number(product.id),
          files,
          imageFolder,
        );
      }

      return this.findOnePlain(product.id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async uploadImages(
    files: Express.Multer.File[],
    uploadDto: UploadProductImagesDto,
  ) {
    const { productId, folder = 'products' } = uploadDto;

    try {
      const uploadedImages =
        await this.productImageService.uploadImagesForProduct(
          Number(productId),
          files,
          folder,
        );

      return {
        message: `${uploadedImages.images.length} images uploaded successfully`,
        images: uploadedImages.images.map((img) => ({
          id: img.id,
          url: img.url,
          publicId: img.publicId,
          originalName: img.originalName,
          format: img.format,
          width: img.width,
          height: img.height,
          bytes: img.bytes,
        })),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async deleteImage(imageId: number) {
    try {
      return await this.productImageService.deleteImage(imageId);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
      where: {
        images: {
          isActive: true,
        },
      },
    });

    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        originalName: image.originalName,
        format: image.format,
        width: image.width,
        height: image.height,
        bytes: image.bytes,
      })),
    }));
  }

  async findOnePlain(term: string) {
    const { images = [], ...product } = await this.findOneByTerm(term);
    return {
      ...product,
      images: images
        .filter((image) => image.isActive)
        .map((image) => ({
          id: image.id,
          url: image.url,
          originalName: image.originalName,
          format: image.format,
          width: image.width,
          height: image.height,
          bytes: image.bytes,
        })),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    try {
      await this.productRepository.save(product);
      return this.findOnePlain(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async updateWithImages(
    id: string,
    updateProductDto: UpdateProductWithImagesDto,
    files?: Express.Multer.File[],
  ) {
    try {
      const {
        imageFolder = 'products',
        imageAction = 'add',
        ...productData
      } = updateProductDto;

      // 1. Actualizar datos del producto
      const product = await this.productRepository.preload({
        id: id,
        ...productData,
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.productRepository.save(product);

      // 2. Manejar imágenes si las hay
      if (files && files.length > 0) {
        if (imageAction === 'replace') {
          // Reemplazar todas las imágenes existentes
          await this.productImageService.replaceProductImages(
            Number(id),
            files,
            imageFolder,
          );
        } else {
          // Agregar nuevas imágenes
          await this.productImageService.uploadImagesForProduct(
            Number(id),
            files,
            imageFolder,
          );
        }
      }

      return this.findOnePlain(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOneByTerm(id);

    // Eliminar todas las imágenes del producto
    for (const image of product.images) {
      await this.productImageService.deleteImage(image.id);
    }

    const deletedProduct = await this.productRepository.remove(product);
    if (deletedProduct) {
      return { message: `Product deleted successfully` };
    }
  }

  private async findOneByTerm(term: string): Promise<Product> {
    let product: Product | null = null;

    if (IsUUID(term)) {
      product = await this.productRepository.findOne({
        where: { id: term },
        relations: { images: true },
      });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'images')
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product not found`);

    return product;
  }

  private handleDBExceptions(error: unknown): never {
    // Verificar si es un error de PostgreSQL usando la utility function
    if (isPostgresError(error)) {
      const { code, detail } = error.driverError;

      // Manejar violación de constraint único (duplicate key)
      if (code === '23505') {
        throw new BadRequestException(detail);
      }

      // Aquí se pueden agregar más códigos de error de PostgreSQL
      // Por ejemplo:
      // - 23502: violación de NOT NULL
      // - 23503: violación de foreign key
      // - 23514: violación de CHECK constraint
    }

    // Si es un QueryFailedError pero no tiene la estructura de PostgreSQL
    if (error instanceof QueryFailedError) {
      this.logger.error(`Database query failed: ${error.message}`);
      throw new InternalServerErrorException('An unexpected error occurred');
    }

    // Para cualquier otro tipo de error
    this.logger.error(`Unexpected error: ${String(error)}`);
    throw new InternalServerErrorException('An unexpected error occurred');
  }
}
