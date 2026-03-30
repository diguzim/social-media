import { Injectable } from "@nestjs/common";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { Image } from "src/core/domain/image/image.entity";
import {
  ImageRepository,
  SaveProfileImageData,
} from "src/core/domain/image/image.repository";

@Injectable()
export class InMemoryImageRepository implements ImageRepository {
  private readonly imagesByUserId = new Map<string, Image>();
  private readonly imagesByPostId = new Map<string, Image[]>();
  private nextId = 1;

  constructor() {
    this.seedProfileImages();
  }

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

  async savePostImage(data: {
    postId: string;
    userId: string;
    mimeType: string;
    storagePath: string;
    orderIndex: number;
  }): Promise<Image> {
    const image = new Image({
      id: `img-${this.nextId++}`,
      postId: data.postId,
      userId: data.userId,
      mimeType: data.mimeType,
      storagePath: data.storagePath,
      orderIndex: data.orderIndex,
      uploadedAt: new Date(),
    });

    const images = this.imagesByPostId.get(data.postId) ?? [];
    images.push(image);
    this.imagesByPostId.set(data.postId, images);

    return image;
  }

  async findPostImageById(
    postId: string,
    imageId: string,
  ): Promise<Image | null> {
    const images = this.imagesByPostId.get(postId) ?? [];
    return images.find((img) => img.id === imageId) ?? null;
  }

  async findPostImagesByPostId(postId: string): Promise<Image[]> {
    const images = this.imagesByPostId.get(postId) ?? [];
    return [...images].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );
  }

  async deletePostImage(postId: string, imageId: string): Promise<void> {
    const images = this.imagesByPostId.get(postId) ?? [];
    const filtered = images.filter((img) => img.id !== imageId);
    filtered.forEach((img, idx) => {
      img.orderIndex = idx;
    });
    this.imagesByPostId.set(postId, filtered);
  }

  async reorderPostImages(postId: string, imageOrder: string[]): Promise<void> {
    const images = this.imagesByPostId.get(postId) ?? [];
    const imageMap = new Map(images.map((img) => [img.id, img]));
    const reordered = imageOrder
      .map((id) => imageMap.get(id))
      .filter((img): img is Image => img !== undefined);

    reordered.forEach((img, idx) => {
      img.orderIndex = idx;
    });

    this.imagesByPostId.set(postId, reordered);
  }

  private seedProfileImages(): void {
    const baseDir = resolve(
      process.env.IMAGE_STORAGE_DIR ?? join(process.cwd(), ".data", "images"),
    );
    mkdirSync(baseDir, { recursive: true });

    const defaultSeedAvatarPath = resolve(process.cwd(), "avatar-128.png");
    const seedAvatarBuffer = existsSync(defaultSeedAvatarPath)
      ? readFileSync(defaultSeedAvatarPath)
      : Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5M4jYAAAAASUVORK5CYII=",
          "base64",
        );

    // Seed only a subset of users on purpose.
    const seededUsers = [
      { userId: "1", uploadedAt: new Date("2025-01-06T09:00:00.000Z") },
      { userId: "3", uploadedAt: new Date("2025-01-06T09:05:00.000Z") },
      { userId: "5", uploadedAt: new Date("2025-01-06T09:10:00.000Z") },
    ];

    for (const seed of seededUsers) {
      const storagePath = join(baseDir, `seed-user-${seed.userId}.png`);
      writeFileSync(storagePath, seedAvatarBuffer);

      const image = new Image({
        id: `img-${this.nextId++}`,
        userId: seed.userId,
        mimeType: "image/png",
        storagePath,
        uploadedAt: seed.uploadedAt,
      });

      this.imagesByUserId.set(seed.userId, image);
    }
  }
}
