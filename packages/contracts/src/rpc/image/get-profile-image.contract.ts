export interface GetProfileImageRequest {
  userId: string;
  correlationId?: string;
}

export interface GetProfileImageReply {
  imageId: string;
  userId: string;
  fileBase64: string;
  contentLength: number;
  mimeType: string;
  uploadedAt: string;
}
