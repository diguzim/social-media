import { Module } from "@nestjs/common";
import { ImageRepository } from "src/core/domain/image/image.repository";
import { InMemoryImageRepository } from "./in-memory/repositories/in-memory-image.repository";

@Module({
  providers: [
    {
      provide: ImageRepository,
      useClass: InMemoryImageRepository,
    },
  ],
  exports: [ImageRepository],
})
export class DatabaseModule {}
