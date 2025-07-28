import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileUploadStrategy } from '../interfaces/file-upload.interface';
import { CloudinaryUploadStrategy } from '../strategies/cloudinary-upload.strategy';
import { LocalUploadStrategy } from '../strategies/local-upload.strategy';

export enum UploadProvider {
  CLOUDINARY = 'cloudinary',
  LOCAL = 'local',
  AWS_S3 = 'aws-s3',
}

@Injectable()
export class FileUploadFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly cloudinaryStrategy: CloudinaryUploadStrategy,
    private readonly localStrategy: LocalUploadStrategy,
  ) {}

  createUploadStrategy(provider?: UploadProvider | string): FileUploadStrategy {
    const uploadProvider = this.getUploadProvider(provider);

    switch (uploadProvider) {
      case UploadProvider.CLOUDINARY:
        return this.cloudinaryStrategy;
      case UploadProvider.LOCAL:
        return this.localStrategy;
      // case UploadProvider.AWS_S3:
      //   return this.s3Strategy;
      default:
        return this.cloudinaryStrategy;
    }
  }

  private getUploadProvider(
    provider?: UploadProvider | string,
  ): UploadProvider {
    if (
      provider &&
      Object.values(UploadProvider).includes(provider as UploadProvider)
    ) {
      return provider as UploadProvider;
    }

    const configProvider = this.configService.get<string>(
      'UPLOAD_PROVIDER',
      UploadProvider.CLOUDINARY,
    );

    if (
      Object.values(UploadProvider).includes(configProvider as UploadProvider)
    ) {
      return configProvider as UploadProvider;
    }

    return UploadProvider.CLOUDINARY;
  }
}
