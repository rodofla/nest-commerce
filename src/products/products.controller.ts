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
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

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

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public endpoints (no auth required)
  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve paginated list of products (public endpoint)',
  })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
    // TODO: Add product response schema
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of products to skip',
    example: 0,
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  @ApiOperation({
    summary: 'Get product by ID, slug, or title',
    description:
      'Retrieve a single product by various search terms (public endpoint)',
  })
  @ApiParam({
    name: 'term',
    description: 'Product ID (UUID), slug, or title to search for',
    example: 'premium-cotton-t-shirt',
  })
  @ApiOkResponse({
    description: 'Product found',
    // TODO: Add product response schema
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  async findOne(@Param('term') term: string) {
    return await this.productsService.findOnePlain(term);
  }

  // Protected endpoints (require authentication and permissions)
  @Post()
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Create a new product (requires PRODUCT_CREATE permission)',
  })
  @ApiCreatedResponse({
    description: 'Product created successfully',
    // TODO: Add product response schema
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @ApiBearerAuth('access-token')
  @Protected(CommonPermissions.PRODUCT_CREATE)
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productsService.create(createProductDto, user);
  }

  @Post('with-images')
  @ApiOperation({
    summary: 'Create product with images',
    description: 'Create a new product and upload images in a single request',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data with optional image files',
    type: CreateProductWithImagesDto,
  })
  @ApiCreatedResponse({
    description: 'Product with images created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or file validation errors',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @ApiBearerAuth('access-token')
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
        fileIsRequired: false, // Images are optional
      }),
    )
    files?: Express.Multer.File[],
  ) {
    return this.productsService.createWithImages(createProductDto, user, files);
  }

  @Post(':id/images')
  @ApiOperation({
    summary: 'Upload images to existing product',
    description: 'Add images to an existing product',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image files to upload (max 10 files, 2MB each)',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        folder: {
          type: 'string',
          description: 'Optional folder name',
          default: 'products',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Images uploaded successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid files or product not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @ApiBearerAuth('access-token')
  @Protected(CommonPermissions.PRODUCT_UPDATE)
  @UseInterceptors(FilesInterceptor('files', 10)) // Maximum 10 images
  async uploadImages(
    @Param('id', ParseUUIDPipe) productId: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB per image
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
  @ApiOperation({
    summary: 'Delete product image',
    description: 'Remove an image from a product',
  })
  @ApiParam({
    name: 'imageId',
    description: 'Image ID to delete',
    type: 'number',
  })
  @ApiOkResponse({
    description: 'Image deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Image not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @ApiBearerAuth('access-token')
  @Protected(CommonPermissions.PRODUCT_DELETE)
  async deleteImage(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.productsService.deleteImage(imageId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update product',
    description: 'Update product information (without images)',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @ApiBearerAuth('access-token')
  @Protected(CommonPermissions.PRODUCT_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/with-images')
  @ApiOperation({
    summary: 'Update product with images',
    description: 'Update product information and optionally add new images',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data with optional new image files',
    type: UpdateProductWithImagesDto,
  })
  @ApiOkResponse({
    description: 'Product updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or file validation errors',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @ApiBearerAuth('access-token')
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
        fileIsRequired: false, // Images are optional
      }),
    )
    files?: Express.Multer.File[],
  ) {
    return this.productsService.updateWithImages(id, updateProductDto, files);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product',
    description: 'Remove a product and all its associated data',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @ApiBearerAuth('access-token')
  @Protected(CommonPermissions.PRODUCT_DELETE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
