import { Injectable } from "@nestjs/common";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { basename, join, resolve } from "path";
import {
  ImageStorageProvider,
  SaveProfileImageInput,
  SavePostImageInput,
  SaveUserPhotoInput,
} from "./image-storage.provider";

@Injectable()
export class LocalFileStorageProvider implements ImageStorageProvider {
  private readonly baseDir = resolve(
    process.env.IMAGE_STORAGE_DIR ?? join(process.cwd(), ".data", "images"),
  );

  async saveProfileImage(input: SaveProfileImageInput): Promise<string> {
    await mkdir(this.baseDir, { recursive: true });

    const sanitizedName = basename(input.originalName).replace(
      /[^a-zA-Z0-9_.-]/g,
      "_",
    );
    const filename = `${input.userId}-${Date.now()}-${sanitizedName}`;
    const fullPath = join(this.baseDir, filename);

    await writeFile(fullPath, input.fileBuffer);
    return fullPath;
  }

  async readProfileImage(storagePath: string): Promise<Buffer> {
    return readFile(storagePath);
  }

  async savePostImage(input: SavePostImageInput): Promise<string> {
    await mkdir(this.baseDir, { recursive: true });

    const sanitizedName = basename(input.originalName).replace(
      /[^a-zA-Z0-9_.-]/g,
      "_",
    );
    const filename = `post-${input.postId}-${input.userId}-${Date.now()}-${sanitizedName}`;
    const fullPath = join(this.baseDir, filename);

    await writeFile(fullPath, input.fileBuffer);
    return fullPath;
  }

  async readPostImage(storagePath: string): Promise<Buffer> {
    return readFile(storagePath);
  }

  async saveUserPhoto(input: SaveUserPhotoInput): Promise<string> {
    await mkdir(this.baseDir, { recursive: true });

    const sanitizedName = basename(input.originalName).replace(
      /[^a-zA-Z0-9_.-]/g,
      "_",
    );
    const filename = `uph-${input.ownerUserId}-${Date.now()}-${sanitizedName}`;
    const fullPath = join(this.baseDir, filename);

    await writeFile(fullPath, input.fileBuffer);
    return fullPath;
  }

  async readUserPhoto(storagePath: string): Promise<Buffer> {
    return readFile(storagePath);
  }

  async deleteFile(storagePath: string): Promise<void> {
    await rm(storagePath, { force: true });
  }
}
