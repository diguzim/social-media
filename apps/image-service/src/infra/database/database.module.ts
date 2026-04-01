import { Module } from "@nestjs/common";
import { ImageRepository } from "src/core/domain/image/image.repository";
import { UserAlbumRepository } from "src/core/domain/image/user-album.repository";
import { UserPhotoRepository } from "src/core/domain/image/user-photo.repository";
import { InMemoryImageRepository } from "./in-memory/repositories/in-memory-image.repository";
import { InMemoryUserAlbumRepository } from "./in-memory/repositories/in-memory-user-album.repository";
import { InMemoryUserPhotoRepository } from "./in-memory/repositories/in-memory-user-photo.repository";

@Module({
  providers: [
    {
      provide: ImageRepository,
      useClass: InMemoryImageRepository,
    },
    {
      provide: UserAlbumRepository,
      useClass: InMemoryUserAlbumRepository,
    },
    {
      provide: UserPhotoRepository,
      useClass: InMemoryUserPhotoRepository,
    },
  ],
  exports: [ImageRepository, UserAlbumRepository, UserPhotoRepository],
})
export class DatabaseModule {}
