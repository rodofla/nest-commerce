import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
  FileUploadStrategy,
  UploadResult,
} from '../interfaces/file-upload.interface';

@Injectable()
export class LocalUploadStrategy implements FileUploadStrategy {
  private readonly uploadPath = join(process.cwd(), 'uploads', 'products');

  async upload(
    file: Express.Multer.File,
    folder: string = 'products',
  ): Promise<UploadResult> {
    try {
      // Crear directorio si no existe
      await fs.mkdir(join(this.uploadPath, folder), { recursive: true });

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const extension = file.originalname.split('.').pop();
      const fileName = `${timestamp}.${extension}`;
      const filePath = join(this.uploadPath, folder, fileName);

      // Guardar archivo
      await fs.writeFile(filePath, file.buffer);

      const publicId = `${folder}/${fileName}`;
      const url = `/uploads/${publicId}`;

      return {
        url,
        publicId,
        format: extension || 'unknown',
        bytes: file.size,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload image locally: ${errorMessage}`);
    }
  }

  async delete(publicId: string): Promise<void> {
    try {
      const filePath = join(this.uploadPath, publicId);
      await fs.unlink(filePath);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete local image: ${errorMessage}`);
    }
  }
}
