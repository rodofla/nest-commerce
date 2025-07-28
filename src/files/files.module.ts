import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CloudinaryUploadStrategy } from './strategies/cloudinary-upload.strategy';
import { LocalUploadStrategy } from './strategies/local-upload.strategy';
import { FileUploadFactory } from './factories/file-upload.factory';

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    CloudinaryUploadStrategy,
    LocalUploadStrategy,
    FileUploadFactory,
  ],
  exports: [FilesService, FileUploadFactory], // ← Exportar FileUploadFactory
})
export class FilesModule {}
