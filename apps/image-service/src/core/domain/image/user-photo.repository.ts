import { UserPhoto } from "./user-photo.entity";

export interface CreateUserPhotoData {
  ownerUserId: string;
  albumId?: string | null;
  description?: string;
  mimeType: string;
  storagePath: string;
}

export interface UpdateUserPhotoData {
  albumId?: string | null;
  description?: string | null;
}

export abstract class UserPhotoRepository {
  abstract create(data: CreateUserPhotoData): Promise<UserPhoto>;
  abstract findById(photoId: string): Promise<UserPhoto | null>;
  abstract findByIdAndOwner(
    photoId: string,
    ownerUserId: string,
  ): Promise<UserPhoto | null>;
  abstract listByOwner(ownerUserId: string): Promise<UserPhoto[]>;
  abstract updateById(
    photoId: string,
    data: UpdateUserPhotoData,
  ): Promise<UserPhoto>;
  abstract listByAlbumId(albumId: string): Promise<UserPhoto[]>;
  abstract deleteByAlbumId(albumId: string): Promise<void>;
  abstract deleteById(photoId: string): Promise<void>;
}
