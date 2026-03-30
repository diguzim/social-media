import { Injectable } from "@nestjs/common";
import { ImageRepository } from "src/core/domain/image/image.repository";

@Injectable()
export class ReorderPostImagesUseCase {
  constructor(private readonly imageRepository: ImageRepository) {}

  async execute(postId: string, imageOrder: string[]): Promise<void> {
    await this.imageRepository.reorderPostImages(postId, imageOrder);
  }
}
