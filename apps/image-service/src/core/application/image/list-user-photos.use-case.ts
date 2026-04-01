import { Injectable } from "@nestjs/common";
import { UserAlbum } from "src/core/domain/image/user-album.entity";
import { UserPhoto } from "src/core/domain/image/user-photo.entity";
import { UserAlbumRepository } from "src/core/domain/image/user-album.repository";
import { UserPhotoRepository } from "src/core/domain/image/user-photo.repository";

export interface ListUserPhotosOutput {
  albums: Array<UserAlbum & { photos: UserPhoto[] }>;
  unsortedPhotos: UserPhoto[];
}

@Injectable()
export class ListUserPhotosUseCase {
  constructor(
    private readonly userAlbumRepository: UserAlbumRepository,
    private readonly userPhotoRepository: UserPhotoRepository,
  ) {}

  async execute(ownerUserId: string): Promise<ListUserPhotosOutput> {
    const [albums, photos] = await Promise.all([
      this.userAlbumRepository.listByOwner(ownerUserId),
      this.userPhotoRepository.listByOwner(ownerUserId),
    ]);

    const photosByAlbumId = new Map<string, UserPhoto[]>();
    const unsortedPhotos: UserPhoto[] = [];

    photos.forEach((photo) => {
      if (!photo.albumId) {
        unsortedPhotos.push(photo);
        return;
      }

      const current = photosByAlbumId.get(photo.albumId) ?? [];
      current.push(photo);
      photosByAlbumId.set(photo.albumId, current);
    });

    return {
      albums: albums.map((album) => ({
        ...album,
        photos: photosByAlbumId.get(album.id) ?? [],
      })),
      unsortedPhotos,
    };
  }
}
