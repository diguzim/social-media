export interface UploadPostImageRequest {
  postId: string;
  userId: string;
  fileBase64: string;
  mimeType: string;
  originalName: string;
  fileSize: number;
  correlationId?: string;
}

export interface UploadPostImageReply {
  imageId: string;
  postId: string;
  mimeType: string;
  orderIndex: number;
  uploadedAt: string;
}

export interface GetPostImageRequest {
  postId: string;
  imageId: string;
  correlationId?: string;
}

export interface GetPostImageReply {
  imageId: string;
  postId: string;
  fileBase64: string;
  contentLength: number;
  mimeType: string;
  orderIndex: number;
  uploadedAt: string;
}

export interface DeletePostImageRequest {
  postId: string;
  imageId: string;
  userId: string;
  correlationId?: string;
}

export interface DeletePostImageReply {
  success: boolean;
}

export interface ReorderPostImagesRequest {
  postId: string;
  userId: string;
  imageOrder: string[]; // array of imageIds in desired order
  correlationId?: string;
}

export interface ReorderPostImagesReply {
  success: boolean;
}
