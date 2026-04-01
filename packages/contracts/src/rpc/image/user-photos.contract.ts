export interface RpcUserPhotoItem {
  id: string;
  ownerUserId: string;
  albumId: string | null;
  description: string | null;
  mimeType: string;
  uploadedAt: string;
}

export interface RpcUserAlbumItem {
  id: string;
  ownerUserId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateUserAlbumRequest {
  ownerUserId: string;
  name: string;
  description?: string;
  correlationId?: string;
}

export interface CreateUserAlbumReply {
  album: RpcUserAlbumItem;
}

export interface UpdateUserAlbumRequest {
  ownerUserId: string;
  albumId: string;
  name?: string;
  description?: string | null;
  correlationId?: string;
}

export interface UpdateUserAlbumReply {
  album: RpcUserAlbumItem;
}

export interface DeleteUserAlbumRequest {
  ownerUserId: string;
  albumId: string;
  correlationId?: string;
}

export interface DeleteUserAlbumReply {
  success: boolean;
}

export interface ListUserPhotosRequest {
  ownerUserId: string;
  correlationId?: string;
}

export interface ListUserPhotosReply {
  albums: Array<RpcUserAlbumItem & { photos: RpcUserPhotoItem[] }>;
  unsortedPhotos: RpcUserPhotoItem[];
}

export interface UploadUserPhotoRequest {
  ownerUserId: string;
  albumId?: string | null;
  description?: string;
  fileBase64: string;
  mimeType: string;
  originalName: string;
  fileSize: number;
  correlationId?: string;
}

export interface UploadUserPhotoReply {
  photo: RpcUserPhotoItem;
}

export interface UpdateUserPhotoRequest {
  ownerUserId: string;
  photoId: string;
  albumId?: string | null;
  description?: string | null;
  correlationId?: string;
}

export interface UpdateUserPhotoReply {
  photo: RpcUserPhotoItem;
}

export interface DeleteUserPhotoRequest {
  ownerUserId: string;
  photoId: string;
  correlationId?: string;
}

export interface DeleteUserPhotoReply {
  success: boolean;
}

export interface GetUserPhotoRequest {
  ownerUserId: string;
  photoId: string;
  correlationId?: string;
}

export interface GetUserPhotoReply {
  photoId: string;
  ownerUserId: string;
  fileBase64: string;
  contentLength: number;
  mimeType: string;
  uploadedAt: string;
}
