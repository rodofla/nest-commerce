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
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Protected } from 'src/auth/decorators';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CommonPermissions } from 'src/auth/interfaces/valid-roles';

@Controller('files')
@UseGuards(AuthGuard(), PermissionsGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
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
  @Protected(CommonPermissions.FILE_DELETE)
  async deleteProductImage(@Param('publicId') publicId: string) {
    await this.filesService.deleteProductImage(publicId);
    return {
      message: 'Image deleted successfully',
    };
  }
}
