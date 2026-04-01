import { Injectable } from "@nestjs/common";
import {
  CreateUserAlbumData,
  UpdateUserAlbumData,
  UserAlbumRepository,
} from "src/core/domain/image/user-album.repository";
import { UserAlbum } from "src/core/domain/image/user-album.entity";

@Injectable()
export class InMemoryUserAlbumRepository implements UserAlbumRepository {
  private albums: UserAlbum[] = this.seedAlbums();
  private nextId = 1;

  constructor() {
    this.nextId = this.albums.length + 1;
  }

  async create(data: CreateUserAlbumData): Promise<UserAlbum> {
    const now = new Date();
    const album = new UserAlbum({
      id: `alb-${this.nextId++}`,
      ownerUserId: data.ownerUserId,
      name: data.name,
      description: data.description ?? null,
      coverPhotoId: null,
      createdAt: now,
      updatedAt: null,
    });

    this.albums.push(album);
    return album;
  }

  async findById(albumId: string): Promise<UserAlbum | null> {
    return this.albums.find((album) => album.id === albumId) ?? null;
  }

  async findByIdAndOwner(
    albumId: string,
    ownerUserId: string,
  ): Promise<UserAlbum | null> {
    return (
      this.albums.find(
        (album) => album.id === albumId && album.ownerUserId === ownerUserId,
      ) ?? null
    );
  }

  async listByOwner(ownerUserId: string): Promise<UserAlbum[]> {
    return this.albums
      .filter((album) => album.ownerUserId === ownerUserId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateById(
    albumId: string,
    data: UpdateUserAlbumData,
  ): Promise<UserAlbum> {
    const album = this.albums.find((current) => current.id === albumId);
    if (!album) {
      throw new Error("Album not found");
    }

    if (data.name !== undefined) {
      album.name = data.name;
    }

    if (data.description !== undefined) {
      album.description = data.description;
    }

    if (data.coverPhotoId !== undefined) {
      album.coverPhotoId = data.coverPhotoId;
    }

    album.updatedAt = new Date();

    return album;
  }

  async deleteById(albumId: string): Promise<void> {
    this.albums = this.albums.filter((album) => album.id !== albumId);
  }

  private seedAlbums(): UserAlbum[] {
    return [
      new UserAlbum({
        id: "alb-1",
        ownerUserId: "1",
        name: "Alice Travel (Seed)",
        description: "Seeded album with photos",
        coverPhotoId: "uph-2",
        createdAt: new Date("2025-01-10T09:00:00.000Z"),
        updatedAt: null,
      }),
      new UserAlbum({
        id: "alb-2",
        ownerUserId: "1",
        name: "Alice Empty Album (Seed)",
        description: "Seeded empty album",
        coverPhotoId: null,
        createdAt: new Date("2025-01-10T09:05:00.000Z"),
        updatedAt: null,
      }),
      new UserAlbum({
        id: "alb-3",
        ownerUserId: "2",
        name: "Bob Moments (Seed)",
        description: "Seeded album for another user",
        coverPhotoId: "uph-3",
        createdAt: new Date("2025-01-10T09:10:00.000Z"),
        updatedAt: null,
      }),
    ];
  }
}
