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
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
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
  async deleteProductImage(@Param('publicId') publicId: string) {
    await this.filesService.deleteProductImage(publicId);
    return {
      message: 'Image deleted successfully',
    };
  }
}
