import { BadRequestException } from "@nestjs/common";
import { UploadProfileImageUseCase } from "./upload-profile-image.use-case";
import { ImageRepository } from "src/core/domain/image/image.repository";
import { ImageStorageProvider } from "src/infra/storage/image-storage.provider";

const base64Png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5M4jYAAAAASUVORK5CYII=";

describe("UploadProfileImageUseCase", () => {
  const imageRepository: ImageRepository = {
    saveProfileImage: jest.fn(async ({ userId, mimeType, storagePath }) => ({
      id: "img-1",
      userId,
      mimeType,
      storagePath,
      uploadedAt: new Date("2026-03-29T00:00:00.000Z"),
    })),
    findProfileImageByUserId: jest.fn(),
  };

  const imageStorageProvider: ImageStorageProvider = {
    saveProfileImage: jest.fn(async () => "/tmp/profile-image.png"),
  };

  it("uploads a valid png image", async () => {
    const useCase = new UploadProfileImageUseCase(
      imageRepository,
      imageStorageProvider,
    );

    const result = await useCase.execute({
      userId: "user-1",
      fileBase64: base64Png,
      mimeType: "image/png",
      originalName: "avatar.png",
      fileSize: 120,
    });

    expect(result.id).toBe("img-1");
    expect(imageStorageProvider.saveProfileImage).toHaveBeenCalled();
    expect(imageRepository.saveProfileImage).toHaveBeenCalled();
  });

  it("rejects unsupported mime types", async () => {
    const useCase = new UploadProfileImageUseCase(
      imageRepository,
      imageStorageProvider,
    );

    await expect(
      useCase.execute({
        userId: "user-1",
        fileBase64: base64Png,
        mimeType: "image/gif",
        originalName: "avatar.gif",
        fileSize: 120,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
