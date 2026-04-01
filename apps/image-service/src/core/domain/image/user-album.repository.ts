import { UserAlbum } from "./user-album.entity";

export interface CreateUserAlbumData {
  ownerUserId: string;
  name: string;
  description?: string;
}

export interface UpdateUserAlbumData {
  name?: string;
  description?: string | null;
  coverPhotoId?: string | null;
}

export abstract class UserAlbumRepository {
  abstract create(data: CreateUserAlbumData): Promise<UserAlbum>;
  abstract findById(albumId: string): Promise<UserAlbum | null>;
  abstract findByIdAndOwner(
    albumId: string,
    ownerUserId: string,
  ): Promise<UserAlbum | null>;
  abstract listByOwner(ownerUserId: string): Promise<UserAlbum[]>;
  abstract updateById(
    albumId: string,
    data: UpdateUserAlbumData,
  ): Promise<UserAlbum>;
  abstract deleteById(albumId: string): Promise<void>;
}
