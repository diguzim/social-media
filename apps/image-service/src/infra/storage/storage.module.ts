import { Module } from "@nestjs/common";
import { ImageStorageProvider } from "./image-storage.provider";
import { LocalFileStorageProvider } from "./local-file-storage.provider";

@Module({
  providers: [
    {
      provide: ImageStorageProvider,
      useClass: LocalFileStorageProvider,
    },
  ],
  exports: [ImageStorageProvider],
})
export class StorageModule {}
