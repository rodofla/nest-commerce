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

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('with-images')
  @UseInterceptors(FilesInterceptor('files', 10))
  async createWithImages(
    @Body() createProductDto: CreateProductWithImagesDto,
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
    return this.productsService.createWithImages(createProductDto, files);
  }

  @Post(':id/images')
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
  async deleteImage(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.productsService.deleteImage(imageId);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  async findOne(@Param('term') term: string) {
    return await this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/with-images')
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
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
