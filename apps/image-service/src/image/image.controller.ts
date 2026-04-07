import { Controller, Logger } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { IMAGE_COMMANDS } from "@repo/contracts";
import type { RPC } from "@repo/contracts";
import { UploadProfileImageUseCase } from "src/core/application/image/upload-profile-image.use-case";
import { GetProfileImageUseCase } from "src/core/application/image/get-profile-image.use-case";
import { UploadPostImageUseCase } from "src/core/application/image/upload-post-image.use-case";
import { GetPostImageUseCase } from "src/core/application/image/get-post-image.use-case";
import { DeletePostImageUseCase } from "src/core/application/image/delete-post-image.use-case";
import { ReorderPostImagesUseCase } from "src/core/application/image/reorder-post-images.use-case";
import { CreateUserAlbumUseCase } from "src/core/application/image/create-user-album.use-case";
import { UpdateUserAlbumUseCase } from "src/core/application/image/update-user-album.use-case";
import { DeleteUserAlbumUseCase } from "src/core/application/image/delete-user-album.use-case";
import { ListUserPhotosUseCase } from "src/core/application/image/list-user-photos.use-case";
import { UploadUserPhotoUseCase } from "src/core/application/image/upload-user-photo.use-case";
import { DeleteUserPhotoUseCase } from "src/core/application/image/delete-user-photo.use-case";
import { GetUserPhotoUseCase } from "src/core/application/image/get-user-photo.use-case";

@Controller()
export class ImageController {
  private readonly logger = new Logger(ImageController.name);

  constructor(
    private readonly uploadProfileImageUseCase: UploadProfileImageUseCase,
    private readonly getProfileImageUseCase: GetProfileImageUseCase,
    private readonly uploadPostImageUseCase: UploadPostImageUseCase,
    private readonly getPostImageUseCase: GetPostImageUseCase,
    private readonly deletePostImageUseCase: DeletePostImageUseCase,
    private readonly reorderPostImagesUseCase: ReorderPostImagesUseCase,
    private readonly createUserAlbumUseCase: CreateUserAlbumUseCase,
    private readonly updateUserAlbumUseCase: UpdateUserAlbumUseCase,
    private readonly deleteUserAlbumUseCase: DeleteUserAlbumUseCase,
    private readonly listUserPhotosUseCase: ListUserPhotosUseCase,
    private readonly uploadUserPhotoUseCase: UploadUserPhotoUseCase,
    private readonly deleteUserPhotoUseCase: DeleteUserPhotoUseCase,
    private readonly getUserPhotoUseCase: GetUserPhotoUseCase,
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

  @MessagePattern({ cmd: IMAGE_COMMANDS.uploadPostImage })
  async handleUploadPostImage(
    request: RPC.UploadPostImageRequest,
  ): Promise<RPC.UploadPostImageReply> {
    const image = await this.uploadPostImageUseCase.execute({
      postId: request.postId,
      userId: request.userId,
      fileBase64: request.fileBase64,
      mimeType: request.mimeType,
      originalName: request.originalName,
      fileSize: request.fileSize,
    });

    return {
      imageId: image.id,
      postId: request.postId,
      mimeType: image.mimeType,
      orderIndex: image.orderIndex ?? 0,
      uploadedAt: image.uploadedAt.toISOString(),
    };
  }

  @MessagePattern({ cmd: IMAGE_COMMANDS.getPostImage })
  async handleGetPostImage(
    request: RPC.GetPostImageRequest,
  ): Promise<RPC.GetPostImageReply> {
    const { image, fileBuffer } = await this.getPostImageUseCase.execute(
      request.postId,
      request.imageId,
    );

    return {
      imageId: image.id,
      postId: request.postId,
      fileBase64: fileBuffer.toString("base64"),
      contentLength: fileBuffer.length,
      mimeType: image.mimeType,
      orderIndex: image.orderIndex ?? 0,
      uploadedAt: image.uploadedAt.toISOString(),
    };
  }

  @MessagePattern({ cmd: IMAGE_COMMANDS.deletePostImage })
  async handleDeletePostImage(
    request: RPC.DeletePostImageRequest,
  ): Promise<RPC.DeletePostImageReply> {
    await this.deletePostImageUseCase.execute(request.postId, request.imageId);
    return { success: true };
  }

  @MessagePattern({ cmd: IMAGE_COMMANDS.reorderPostImages })
  async handleReorderPostImages(
    request: RPC.ReorderPostImagesRequest,
  ): Promise<RPC.ReorderPostImagesReply> {
    await this.reorderPostImagesUseCase.execute(
      request.postId,
      request.imageOrder,
    );
    return { success: true };
  }

  @MessagePattern({ cmd: IMAGE_COMMANDS.createUserAlbum })
  async handleCreateUserAlbum(
    request: RPC.CreateUserAlbumRequest,
  ): Promise<RPC.CreateUserAlbumReply> {
    const album = await this.createUserAlbumUseCase.execute({
      ownerUserId: request.ownerUserId,
      name: request.name,
      description: request.description,
    });

    return {
      album: {
        id: album.id,
        ownerUserId: album.ownerUserId,
        name: album.name,
        description: album.description,
        coverPhotoId: album.coverPhotoId,
        createdAt: album.createdAt.toISOString(),
        updatedAt: album.updatedAt?.toISOString() ?? null,
      },
    };
  }

  @MessagePattern({ cmd: IMAGE_COMMANDS.updateUserAlbum })
  async handleUpdateUserAlbum(
    request: RPC.UpdateUserAlbumRequest,
  ): Promise<RPC.UpdateUserAlbumReply> {
    const album = await this.updateUserAlbumUseCase.execute({
      ownerUserId: request.ownerUserId,
      albumId: request.albumId,
      name: request.name,
      description: request.description,
    });

    return {
      album: {
        id: album.id,
        ownerUserId: album.ownerUserId,
        name: album.name,
        description: album.description,
        coverPhotoId: album.coverPhotoId,
        createdAt: album.createdAt.toISOString(),
        updatedAt: album.updatedAt?.toISOString() ?? null,
      },
    };
  }

  @MessagePattern({ cmd: IMAGE_COMMANDS.deleteUserAlbum })
  async handleDeleteUserAlbum(
    request: RPC.DeleteUserAlbumRequest,
  ): Promise<RPC.DeleteUserAlbumReply> {
    await this.deleteUserAlbumUseCase.execute({
      ownerUserId: request.ownerUserId,
      albumId: request.albumId,
    });

    return { success: true };
  }

  @MessagePattern({ cmd: IMAGE_COMMANDS.listUserPhotos })
  async handleListUserPhotos(
    request: RPC.ListUserPhotosRequest,
  ): Promise<RPC.ListUserPhotosReply> {
    const result = await this.listUserPhotosUseCase.execute(
      request.ownerUserId,
    );

    return {
      albums: result.albums.map((album) => ({
        id: album.id,
        ownerUserId: album.ownerUserId,
        name: album.name,
        description: album.description,
        coverPhotoId: album.coverPhotoId,
        createdAt: album.createdAt.toISOString(),
        updatedAt: album.updatedAt?.toISOString() ?? null,
        photos: album.photos.map((photo) => ({
          id: photo.id,
          ownerUserId: photo.ownerUserId,
          albumId: photo.albumId,
          description: photo.description,
          mimeType: photo.mimeType,
          uploadedAt: photo.uploadedAt.toISOString(),
        })),
      })),
      unsortedPhotos: result.unsortedPhotos.map((photo) => ({
        id: photo.id,
        ownerUserId: photo.ownerUserId,
        albumId: photo.albumId,
        description: photo.description,
        mimeType: photo.mimeType,
        uploadedAt: photo.uploadedAt.toISOString(),
      })),
    };
  }

  @MessagePattern({ cmd: IMAGE_COMMANDS.uploadUserPhoto })
  async handleUploadUserPhoto(
    request: RPC.UploadUserPhotoRequest,
  ): Promise<RPC.UploadUserPhotoReply> {
    const photo = await this.uploadUserPhotoUseCase.execute({
      ownerUserId: request.ownerUserId,
      albumId: request.albumId,
      description: request.description,
      fileBase64: request.fileBase64,
      mimeType: request.mimeType,
      originalName: request.originalName,
      fileSize: request.fileSize,
    });

    return {
      photo: {
        id: photo.id,
        ownerUserId: photo.ownerUserId,
        albumId: photo.albumId,
        description: photo.description,
        mimeType: photo.mimeType,
        uploadedAt: photo.uploadedAt.toISOString(),
      },
    };
  }

  @MessagePattern({ cmd: IMAGE_COMMANDS.deleteUserPhoto })
  async handleDeleteUserPhoto(
    request: RPC.DeleteUserPhotoRequest,
  ): Promise<RPC.DeleteUserPhotoReply> {
    await this.deleteUserPhotoUseCase.execute({
      ownerUserId: request.ownerUserId,
      photoId: request.photoId,
    });

    return { success: true };
  }

  @MessagePattern({ cmd: IMAGE_COMMANDS.getUserPhoto })
  async handleGetUserPhoto(
    request: RPC.GetUserPhotoRequest,
  ): Promise<RPC.GetUserPhotoReply> {
    const { photo, fileBuffer } = await this.getUserPhotoUseCase.execute(
      request.ownerUserId,
      request.photoId,
    );

    return {
      photoId: photo.id,
      ownerUserId: photo.ownerUserId,
      fileBase64: fileBuffer.toString("base64"),
      contentLength: fileBuffer.length,
      mimeType: photo.mimeType,
      uploadedAt: photo.uploadedAt.toISOString(),
    };
  }
}
