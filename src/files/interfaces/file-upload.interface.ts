export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

export interface FileUploadStrategy {
  upload(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
}

export interface UploadConfig {
  folder?: string;
  transformation?: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
  };
}
