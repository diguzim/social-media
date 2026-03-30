export interface UploadProfileImageRequest {
  userId: string;
  fileBase64: string;
  mimeType: string;
  originalName: string;
  fileSize: number;
  correlationId?: string;
}

export interface UploadProfileImageReply {
  imageId: string;
  userId: string;
  mimeType: string;
  uploadedAt: string;
}
