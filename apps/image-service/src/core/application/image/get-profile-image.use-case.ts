import { Injectable, NotFoundException } from "@nestjs/common";
import { ImageRepository } from "src/core/domain/image/image.repository";

@Injectable()
export class GetProfileImageUseCase {
  constructor(private readonly imageRepository: ImageRepository) {}

  async execute(userId: string) {
    const image = await this.imageRepository.findProfileImageByUserId(userId);

    if (!image) {
      throw new NotFoundException("Profile image not found");
    }

    return image;
  }
}
