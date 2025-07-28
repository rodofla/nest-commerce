import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import {
  FileUploadStrategy,
  UploadResult,
  UploadConfig,
} from '../interfaces/file-upload.interface';

@Injectable()
export class CloudinaryUploadStrategy implements FileUploadStrategy {
  constructor(private readonly configService: ConfigService) {
    this.initializeCloudinary();
  }

  private initializeCloudinary(): void {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async upload(
    file: Express.Multer.File,
    folder: string = 'products',
  ): Promise<UploadResult> {
    try {
      const uploadConfig: UploadConfig = {
        folder,
        transformation: {
          width: 800,
          height: 800,
          quality: 'auto',
          format: 'webp',
        },
      };

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: uploadConfig.folder,
              transformation: [
                {
                  width: uploadConfig.transformation?.width,
                  height: uploadConfig.transformation?.height,
                  crop: 'limit',
                  quality: uploadConfig.transformation?.quality,
                  format: uploadConfig.transformation?.format,
                },
              ],
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) reject(new Error(error.message));
              else if (result) resolve(result);
              else reject(new Error('Upload failed without error details'));
            },
          )
          .end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload image to Cloudinary: ${errorMessage}`);
    }
  }

  async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to delete image from Cloudinary: ${errorMessage}`,
      );
    }
  }
}
