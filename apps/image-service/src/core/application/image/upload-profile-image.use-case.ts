import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { extname } from "path";
import sharp from "sharp";
import { ImageRepository } from "src/core/domain/image/image.repository";
import { ImageStorageProvider } from "src/infra/storage/image-storage.provider";

interface UploadProfileImageInput {
  userId: string;
  fileBase64: string;
  mimeType: string;
  originalName: string;
  fileSize: number;
}

@Injectable()
export class UploadProfileImageUseCase {
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024;
  private static readonly ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
  ]);

  constructor(
    private readonly imageRepository: ImageRepository,
    @Inject(ImageStorageProvider)
    private readonly imageStorageProvider: ImageStorageProvider,
  ) {}

  async execute(input: UploadProfileImageInput) {
    this.validateInput(input);

    const rawFileBuffer = Buffer.from(input.fileBase64, "base64");
    const normalizedBuffer = await sharp(rawFileBuffer)
      .resize(200, 200, { fit: "cover" })
      .toFormat(input.mimeType === "image/png" ? "png" : "jpeg")
      .toBuffer();

    const fileExtension = input.mimeType === "image/png" ? ".png" : ".jpg";
    const safeOriginalName =
      extname(input.originalName).toLowerCase() === fileExtension
        ? input.originalName
        : `${input.originalName}${fileExtension}`;

    const storagePath = await this.imageStorageProvider.saveProfileImage({
      userId: input.userId,
      fileBuffer: normalizedBuffer,
      originalName: safeOriginalName,
    });

    const image = await this.imageRepository.saveProfileImage({
      userId: input.userId,
      mimeType: input.mimeType,
      storagePath,
    });

    return image;
  }

  private validateInput(input: UploadProfileImageInput): void {
    if (!input.fileBase64) {
      throw new BadRequestException("Image file is required");
    }

    if (!UploadProfileImageUseCase.ALLOWED_MIME_TYPES.has(input.mimeType)) {
      throw new BadRequestException("Only JPG and PNG images are allowed");
    }

    if (input.fileSize > UploadProfileImageUseCase.MAX_FILE_SIZE) {
      throw new BadRequestException("Image must be 2MB or smaller");
    }
  }
}
