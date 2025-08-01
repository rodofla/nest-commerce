import {
  Controller,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { FilesService } from './files.service';
import { Protected } from 'src/auth/decorators';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CommonPermissions } from 'src/auth/interfaces/valid-roles';

@ApiTags('Files')
@ApiBearerAuth('access-token')
@Controller('files')
@UseGuards(AuthGuard(), PermissionsGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @ApiOperation({
    summary: 'Upload product image',
    description: 'Upload a single image for product use',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (max 1MB, images only)',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        fileName: {
          type: 'string',
          example: 'product-image.jpg',
        },
        url: {
          type: 'string',
          example:
            'https://cloudinary.com/image/upload/v1234567890/products/image.jpg',
        },
        publicId: {
          type: 'string',
          example: 'products/image_abc123',
        },
        message: {
          type: 'string',
          example: 'File uploaded successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid file format, size exceeded, or upload failed',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected(CommonPermissions.FILE_CREATE)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }), // 1MB
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('File upload failed or file is invalid.');
    }

    const result = await this.filesService.uploadProductImage(file);

    return {
      fileName: file.originalname,
      url: result.url,
      publicId: result.publicId,
      message: 'File uploaded successfully',
    };
  }

  @Delete('product/:publicId')
  @ApiOperation({
    summary: 'Delete product image',
    description: 'Delete an uploaded product image by its public ID',
  })
  @ApiParam({
    name: 'publicId',
    description: 'Public ID of the image to delete',
    example: 'products/image_abc123',
  })
  @ApiOkResponse({
    description: 'Image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Image deleted successfully',
        },
      },
    },
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
  @Protected(CommonPermissions.FILE_DELETE)
  async deleteProductImage(@Param('publicId') publicId: string) {
    await this.filesService.deleteProductImage(publicId);
    return {
      message: 'Image deleted successfully',
    };
  }
}
