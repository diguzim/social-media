export interface UserPhotoItem {
  id: string;
  imageUrl: string;
  mimeType: string;
  description: string | null;
  albumId: string | null;
  uploadedAt: string;
}

export interface UserAlbumItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  photos: UserPhotoItem[];
}

export interface GetUserPhotosResponse {
  albums: UserAlbumItem[];
  unsortedPhotos: UserPhotoItem[];
}

export interface CreateUserAlbumBody {
  name: string;
  description?: string;
}

export interface CreateUserAlbumResponse {
  album: UserAlbumItem;
}

export interface UpdateUserAlbumBody {
  name?: string;
  description?: string | null;
}

export interface UpdateUserAlbumResponse {
  album: UserAlbumItem;
}

export interface DeleteUserAlbumResponse {
  success: boolean;
}

export interface UploadUserPhotoResponse {
  photo: UserPhotoItem;
}

export interface UpdateUserPhotoBody {
  description?: string | null;
  albumId?: string | null;
}

export interface UpdateUserPhotoResponse {
  photo: UserPhotoItem;
}

export interface DeleteUserPhotoResponse {
  success: boolean;
}
