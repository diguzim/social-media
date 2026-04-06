import { Injectable } from "@nestjs/common";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import {
  CreateUserPhotoData,
  UpdateUserPhotoData,
  UserPhotoRepository,
} from "src/core/domain/image/user-photo.repository";
import { UserPhoto } from "src/core/domain/image/user-photo.entity";

@Injectable()
export class InMemoryUserPhotoRepository implements UserPhotoRepository {
  private photos: UserPhoto[] = this.seedPhotos();
  private nextId = 1;

  constructor() {
    this.nextId = this.photos.length + 1;
  }

  async create(data: CreateUserPhotoData): Promise<UserPhoto> {
    const photo = new UserPhoto({
      id: `uph-${this.nextId++}`,
      ownerUserId: data.ownerUserId,
      albumId: data.albumId ?? null,
      description: data.description ?? null,
      mimeType: data.mimeType,
      storagePath: data.storagePath,
      uploadedAt: new Date(),
      updatedAt: null,
    });

    this.photos.push(photo);
    return photo;
  }

  async findById(photoId: string): Promise<UserPhoto | null> {
    return this.photos.find((photo) => photo.id === photoId) ?? null;
  }

  async findByIdAndOwner(
    photoId: string,
    ownerUserId: string,
  ): Promise<UserPhoto | null> {
    return (
      this.photos.find(
        (photo) => photo.id === photoId && photo.ownerUserId === ownerUserId,
      ) ?? null
    );
  }

  async listByOwner(ownerUserId: string): Promise<UserPhoto[]> {
    return this.photos
      .filter((photo) => photo.ownerUserId === ownerUserId)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  async updateById(
    photoId: string,
    data: UpdateUserPhotoData,
  ): Promise<UserPhoto> {
    const photo = this.photos.find((current) => current.id === photoId);
    if (!photo) {
      throw new Error("Photo not found");
    }

    if (data.albumId !== undefined) {
      photo.albumId = data.albumId;
    }

    if (data.description !== undefined) {
      photo.description = data.description;
    }

    photo.updatedAt = new Date();

    return photo;
  }

  async listByAlbumId(albumId: string): Promise<UserPhoto[]> {
    return this.photos
      .filter((photo) => photo.albumId === albumId)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  async deleteByAlbumId(albumId: string): Promise<void> {
    this.photos = this.photos.filter((photo) => photo.albumId !== albumId);
  }

  async deleteById(photoId: string): Promise<void> {
    this.photos = this.photos.filter((photo) => photo.id !== photoId);
  }

  private seedPhotos(): UserPhoto[] {
    const baseDir = resolve(
      process.env.IMAGE_STORAGE_DIR ?? join(process.cwd(), ".data", "images"),
    );
    mkdirSync(baseDir, { recursive: true });

    const defaultSeedAvatarPath = resolve(process.cwd(), "avatar-128.png");
    const seedImageBuffer = existsSync(defaultSeedAvatarPath)
      ? readFileSync(defaultSeedAvatarPath)
      : Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5M4jYAAAAASUVORK5CYII=",
          "base64",
        );

    const seeds = [
      {
        id: "uph-1",
        ownerUserId: "1",
        albumId: null,
        description: "Alice Seed Unsorted",
        filename: "seed-user-photo-alice-unsorted.png",
        uploadedAt: new Date("2025-01-11T08:00:00.000Z"),
      },
      {
        id: "uph-1b",
        ownerUserId: "1",
        albumId: null,
        description: "Alice Seed Unsorted 2",
        filename: "seed-user-photo-alice-unsorted-2.png",
        uploadedAt: new Date("2025-01-11T08:05:00.000Z"),
      },
      {
        id: "uph-2",
        ownerUserId: "1",
        albumId: "alb-1",
        description: "Alice Seed Album Photo",
        filename: "seed-user-photo-alice-album.png",
        uploadedAt: new Date("2025-01-11T08:10:00.000Z"),
      },
      {
        id: "uph-3",
        ownerUserId: "2",
        albumId: "alb-3",
        description: "Bob Seed Album Photo",
        filename: "seed-user-photo-bob-album.png",
        uploadedAt: new Date("2025-01-11T08:20:00.000Z"),
      },
    ] as const;

    return seeds.map((seed) => {
      const storagePath = join(baseDir, seed.filename);
      writeFileSync(storagePath, seedImageBuffer);

      return new UserPhoto({
        id: seed.id,
        ownerUserId: seed.ownerUserId,
        albumId: seed.albumId,
        description: seed.description,
        mimeType: "image/png",
        storagePath,
        uploadedAt: seed.uploadedAt,
        updatedAt: null,
      });
    });
  }
}
