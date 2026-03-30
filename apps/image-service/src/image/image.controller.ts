import { Controller, Logger } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { IMAGE_COMMANDS } from "@repo/contracts";
import type { RPC } from "@repo/contracts";
import { UploadProfileImageUseCase } from "src/core/application/image/upload-profile-image.use-case";
import { GetProfileImageUseCase } from "src/core/application/image/get-profile-image.use-case";

@Controller()
export class ImageController {
  private readonly logger = new Logger(ImageController.name);

  constructor(
    private readonly uploadProfileImageUseCase: UploadProfileImageUseCase,
    private readonly getProfileImageUseCase: GetProfileImageUseCase,
  ) {}

  @MessagePattern({ cmd: IMAGE_COMMANDS.uploadProfileImage })
  async handleUploadProfileImage(
    request: RPC.UploadProfileImageRequest,
  ): Promise<RPC.UploadProfileImageReply> {
    this.logger.debug("Image service: handling upload profile image command", {
      userId: request.userId,
      mimeType: request.mimeType,
      fileSize: request.fileSize,
    });

    const image = await this.uploadProfileImageUseCase.execute({
      userId: request.userId,
      fileBase64: request.fileBase64,
      mimeType: request.mimeType,
      originalName: request.originalName,
      fileSize: request.fileSize,
    });

    return {
      imageId: image.id,
      userId: image.userId,
      mimeType: image.mimeType,
      uploadedAt: image.uploadedAt.toISOString(),
    };
  }

  @MessagePattern({ cmd: IMAGE_COMMANDS.getProfileImage })
  async handleGetProfileImage(
    request: RPC.GetProfileImageRequest,
  ): Promise<RPC.GetProfileImageReply> {
    this.logger.debug("Image service: handling get profile image command", {
      userId: request.userId,
    });

    const { image, fileBuffer } = await this.getProfileImageUseCase.execute(
      request.userId,
    );

    return {
      imageId: image.id,
      userId: image.userId,
      fileBase64: fileBuffer.toString("base64"),
      contentLength: fileBuffer.length,
      mimeType: image.mimeType,
      uploadedAt: image.uploadedAt.toISOString(),
    };
  }
}
