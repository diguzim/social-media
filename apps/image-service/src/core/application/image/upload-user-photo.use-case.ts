import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { extname } from "path";
import { UserPhoto } from "src/core/domain/image/user-photo.entity";
import { UserAlbumRepository } from "src/core/domain/image/user-album.repository";
import { UserPhotoRepository } from "src/core/domain/image/user-photo.repository";
import { ImageStorageProvider } from "src/infra/storage/image-storage.provider";

interface UploadUserPhotoInput {
  ownerUserId: string;
  albumId?: string | null;
  description?: string;
  fileBase64: string;
  mimeType: string;
  originalName: string;
  fileSize: number;
}

@Injectable()
export class UploadUserPhotoUseCase {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
  private static readonly ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
  ]);

  constructor(
    private readonly userPhotoRepository: UserPhotoRepository,
    private readonly userAlbumRepository: UserAlbumRepository,
    @Inject(ImageStorageProvider)
    private readonly imageStorageProvider: ImageStorageProvider,
  ) {}

  async execute(input: UploadUserPhotoInput): Promise<UserPhoto> {
    this.validateInput(input);

    const normalizedAlbumId = input.albumId ?? null;
    if (normalizedAlbumId) {
      const album = await this.userAlbumRepository.findByIdAndOwner(
        normalizedAlbumId,
        input.ownerUserId,
      );
      if (!album) {
        throw new BadRequestException("Album not found for user");
      }
    }

    const rawFileBuffer = Buffer.from(input.fileBase64, "base64");
    const fileExtension = this.getExtensionFromMimeType(input.mimeType);
    const safeOriginalName =
      extname(input.originalName).toLowerCase() === fileExtension
        ? input.originalName
        : `${input.originalName}${fileExtension}`;

    const storagePath = await this.imageStorageProvider.saveUserPhoto({
      ownerUserId: input.ownerUserId,
      fileBuffer: rawFileBuffer,
      originalName: safeOriginalName,
    });

    return this.userPhotoRepository.create({
      ownerUserId: input.ownerUserId,
      albumId: normalizedAlbumId,
      description: input.description?.trim() || undefined,
      mimeType: input.mimeType,
      storagePath,
    });
  }

  private validateInput(input: UploadUserPhotoInput): void {
    if (!input.fileBase64) {
      throw new BadRequestException("Image file is required");
    }

    if (!UploadUserPhotoUseCase.ALLOWED_MIME_TYPES.has(input.mimeType)) {
      throw new BadRequestException("Only JPG, PNG and GIF images are allowed");
    }

    if (input.fileSize > UploadUserPhotoUseCase.MAX_FILE_SIZE) {
      throw new BadRequestException("Image must be 10MB or smaller");
    }
  }

  private getExtensionFromMimeType(mimeType: string): string {
    if (mimeType === "image/png") return ".png";
    if (mimeType === "image/gif") return ".gif";
    return ".jpg";
  }
}
