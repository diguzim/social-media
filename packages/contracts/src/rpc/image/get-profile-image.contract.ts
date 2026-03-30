export interface GetProfileImageRequest {
  userId: string;
  correlationId?: string;
}

export interface GetProfileImageReply {
  imageId: string;
  userId: string;
  storagePath: string;
  mimeType: string;
  uploadedAt: string;
}
