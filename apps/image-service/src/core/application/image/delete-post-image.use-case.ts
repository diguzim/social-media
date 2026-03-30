import { Injectable, NotFoundException } from "@nestjs/common";
import { ImageRepository } from "src/core/domain/image/image.repository";

@Injectable()
export class DeletePostImageUseCase {
  constructor(private readonly imageRepository: ImageRepository) {}

  async execute(postId: string, imageId: string): Promise<void> {
    const image = await this.imageRepository.findPostImageById(postId, imageId);
    if (!image) {
      throw new NotFoundException("Post image not found");
    }

    await this.imageRepository.deletePostImage(postId, imageId);
  }
}
