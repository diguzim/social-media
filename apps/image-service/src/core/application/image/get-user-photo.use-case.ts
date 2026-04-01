import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserPhotoRepository } from "src/core/domain/image/user-photo.repository";
import { ImageStorageProvider } from "src/infra/storage/image-storage.provider";

@Injectable()
export class GetUserPhotoUseCase {
  constructor(
    private readonly userPhotoRepository: UserPhotoRepository,
    @Inject(ImageStorageProvider)
    private readonly imageStorageProvider: ImageStorageProvider,
  ) {}

  async execute(ownerUserId: string, photoId: string) {
    const photo = await this.userPhotoRepository.findByIdAndOwner(
      photoId,
      ownerUserId,
    );

    if (!photo) {
      throw new NotFoundException("Photo not found");
    }

    const fileBuffer = await this.imageStorageProvider.readUserPhoto(
      photo.storagePath,
    );

    return { photo, fileBuffer };
  }
}
