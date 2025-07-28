export interface ImageUploadResult {
  id: number;
  url: string;
  publicId: string;
  originalName: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

export interface ImageUploadResponse {
  message: string;
  images: ImageUploadResult[];
}

export interface ImageDeleteResponse {
  message: string;
}
