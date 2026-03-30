import { Injectable } from "@nestjs/common";
import { Image } from "src/core/domain/image/image.entity";
import {
  ImageRepository,
  SaveProfileImageData,
} from "src/core/domain/image/image.repository";

@Injectable()
export class InMemoryImageRepository implements ImageRepository {
  private readonly imagesByUserId = new Map<string, Image>();
  private nextId = 1;

  async saveProfileImage(data: SaveProfileImageData): Promise<Image> {
    const image = new Image({
      id: `img-${this.nextId++}`,
      userId: data.userId,
      mimeType: data.mimeType,
      storagePath: data.storagePath,
      uploadedAt: new Date(),
    });

    this.imagesByUserId.set(data.userId, image);
    return image;
  }

  async findProfileImageByUserId(userId: string): Promise<Image | null> {
    return this.imagesByUserId.get(userId) ?? null;
  }
}
