import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ImageRepository } from "src/core/domain/image/image.repository";
import { ImageStorageProvider } from "src/infra/storage/image-storage.provider";

@Injectable()
export class GetProfileImageUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    @Inject(ImageStorageProvider)
    private readonly imageStorageProvider: ImageStorageProvider,
  ) {}

  async execute(userId: string) {
    const image = await this.imageRepository.findProfileImageByUserId(userId);

    if (!image) {
      throw new NotFoundException("Profile image not found");
    }

    const fileBuffer = await this.imageStorageProvider.readProfileImage(
      image.storagePath,
    );

    return {
      image,
      fileBuffer,
    };
  }
}
