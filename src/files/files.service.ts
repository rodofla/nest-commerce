import { Injectable } from '@nestjs/common';
import { FileUploadFactory } from './factories/file-upload.factory';
import { UploadResult } from './interfaces/file-upload.interface';

@Injectable()
export class FilesService {
  constructor(private readonly fileUploadFactory: FileUploadFactory) {}

  async uploadProductImage(
    file: Express.Multer.File,
    folder: string = 'products',
  ): Promise<UploadResult> {
    const uploadStrategy = this.fileUploadFactory.createUploadStrategy();
    return uploadStrategy.upload(file, folder);
  }

  async deleteProductImage(publicId: string): Promise<void> {
    const uploadStrategy = this.fileUploadFactory.createUploadStrategy();
    return uploadStrategy.delete(publicId);
  }
}
