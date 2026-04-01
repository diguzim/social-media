import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserAlbumRepository } from "src/core/domain/image/user-album.repository";
import { UserPhotoRepository } from "src/core/domain/image/user-photo.repository";
import { ImageStorageProvider } from "src/infra/storage/image-storage.provider";

interface DeleteUserAlbumInput {
  ownerUserId: string;
  albumId: string;
}

@Injectable()
export class DeleteUserAlbumUseCase {
  constructor(
    private readonly userAlbumRepository: UserAlbumRepository,
    private readonly userPhotoRepository: UserPhotoRepository,
    private readonly imageStorageProvider: ImageStorageProvider,
  ) {}

  async execute(input: DeleteUserAlbumInput): Promise<void> {
    const album = await this.userAlbumRepository.findById(input.albumId);
    if (!album) {
      throw new NotFoundException("Album not found");
    }

    if (album.ownerUserId !== input.ownerUserId) {
      throw new ForbiddenException("Only owner can delete album");
    }

    const albumPhotos = await this.userPhotoRepository.listByAlbumId(
      input.albumId,
    );
    for (const photo of albumPhotos) {
      await this.imageStorageProvider.deleteFile(photo.storagePath);
    }

    await this.userPhotoRepository.deleteByAlbumId(input.albumId);
    await this.userAlbumRepository.deleteById(input.albumId);
  }
}
