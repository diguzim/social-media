import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { extname } from "path";
import { ImageRepository } from "src/core/domain/image/image.repository";
import { ImageStorageProvider } from "src/infra/storage/image-storage.provider";

interface UploadPostImageInput {
  postId: string;
  userId: string;
  fileBase64: string;
  mimeType: string;
  originalName: string;
  fileSize: number;
}

@Injectable()
export class UploadPostImageUseCase {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
  private static readonly ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
  ]);

  constructor(
    private readonly imageRepository: ImageRepository,
    @Inject(ImageStorageProvider)
    private readonly imageStorageProvider: ImageStorageProvider,
  ) {}

  async execute(input: UploadPostImageInput) {
    this.validateInput(input);

    const rawFileBuffer = Buffer.from(input.fileBase64, "base64");
    const fileExtension = this.getExtensionFromMimeType(input.mimeType);
    const safeOriginalName =
      extname(input.originalName).toLowerCase() === fileExtension
        ? input.originalName
        : `${input.originalName}${fileExtension}`;

    const currentImages = await this.imageRepository.findPostImagesByPostId(
      input.postId,
    );

    if (currentImages.length >= 10) {
      throw new BadRequestException("A post can have at most 10 images");
    }

    const storagePath = await this.imageStorageProvider.savePostImage({
      postId: input.postId,
      userId: input.userId,
      fileBuffer: rawFileBuffer,
      originalName: safeOriginalName,
    });

    const image = await this.imageRepository.savePostImage({
      postId: input.postId,
      userId: input.userId,
      mimeType: input.mimeType,
      storagePath,
      orderIndex: currentImages.length,
    });

    return image;
  }

  private validateInput(input: UploadPostImageInput): void {
    if (!input.fileBase64) {
      throw new BadRequestException("Image file is required");
    }

    if (!UploadPostImageUseCase.ALLOWED_MIME_TYPES.has(input.mimeType)) {
      throw new BadRequestException("Only JPG, PNG and GIF images are allowed");
    }

    if (input.fileSize > UploadPostImageUseCase.MAX_FILE_SIZE) {
      throw new BadRequestException("Each image must be 10MB or smaller");
    }
  }

  private getExtensionFromMimeType(mimeType: string): string {
    if (mimeType === "image/png") return ".png";
    if (mimeType === "image/gif") return ".gif";
    return ".jpg";
  }
}
