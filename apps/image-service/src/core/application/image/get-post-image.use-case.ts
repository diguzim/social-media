import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ImageRepository } from "src/core/domain/image/image.repository";
import { ImageStorageProvider } from "src/infra/storage/image-storage.provider";

@Injectable()
export class GetPostImageUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    @Inject(ImageStorageProvider)
    private readonly imageStorageProvider: ImageStorageProvider,
  ) {}

  async execute(postId: string, imageId: string) {
    const image = await this.imageRepository.findPostImageById(postId, imageId);

    if (!image) {
      throw new NotFoundException("Post image not found");
    }

    const fileBuffer = await this.imageStorageProvider.readPostImage(
      image.storagePath,
    );

    return {
      image,
      fileBuffer,
    };
  }
}
