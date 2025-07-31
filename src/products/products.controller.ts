import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductWithImagesDto } from './dto/create-product-with-images.dto';
import { UpdateProductWithImagesDto } from './dto/update-product-with-images.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UploadProductImagesDto } from './dto/upload-product-images.dto';
import { GetUser, Protected } from 'src/auth/decorators';

import { User } from 'src/auth/entities/user.entity';
import { CommonPermissions } from 'src/auth/interfaces/valid-roles';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public endpoints (no auth required)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  async findOne(@Param('term') term: string) {
    return await this.productsService.findOnePlain(term);
  }

  // Protected endpoints (require authentication and permissions)
  @Post()
  @Protected(CommonPermissions.PRODUCT_CREATE)
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productsService.create(createProductDto, user);
  }

  @Post('with-images')
  @Protected(CommonPermissions.PRODUCT_CREATE)
  @UseInterceptors(FilesInterceptor('files', 10))
  async createWithImages(
    @Body() createProductDto: CreateProductWithImagesDto,
    @GetUser() user: User,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false, // Imágenes opcionales
      }),
    )
    files?: Express.Multer.File[],
  ) {
    return this.productsService.createWithImages(createProductDto, user, files);
  }

  @Post(':id/images')
  @Protected(CommonPermissions.PRODUCT_UPDATE)
  @UseInterceptors(FilesInterceptor('files', 10)) // Máximo 10 imágenes
  async uploadImages(
    @Param('id', ParseUUIDPipe) productId: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB por imagen
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @Body() uploadDto?: Partial<UploadProductImagesDto>,
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const uploadData: UploadProductImagesDto = {
      productId,
      folder: uploadDto?.folder || 'products',
    };

    return this.productsService.uploadImages(files, uploadData);
  }

  @Delete('images/:imageId')
  @Protected(CommonPermissions.PRODUCT_DELETE)
  async deleteImage(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.productsService.deleteImage(imageId);
  }

  @Patch(':id')
  @Protected(CommonPermissions.PRODUCT_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/with-images')
  @Protected(CommonPermissions.PRODUCT_UPDATE)
  @UseInterceptors(FilesInterceptor('files', 10))
  async updateWithImages(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductWithImagesDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false, // Imágenes opcionales
      }),
    )
    files?: Express.Multer.File[],
  ) {
    return this.productsService.updateWithImages(id, updateProductDto, files);
  }

  @Delete(':id')
  @Protected(CommonPermissions.PRODUCT_DELETE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
