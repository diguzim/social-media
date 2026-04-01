import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserPhoto } from "src/core/domain/image/user-photo.entity";
import { UserAlbumRepository } from "src/core/domain/image/user-album.repository";
import { UserPhotoRepository } from "src/core/domain/image/user-photo.repository";

interface UpdateUserPhotoInput {
  ownerUserId: string;
  photoId: string;
  albumId?: string | null;
  description?: string | null;
}

@Injectable()
export class UpdateUserPhotoUseCase {
  constructor(
    private readonly userPhotoRepository: UserPhotoRepository,
    private readonly userAlbumRepository: UserAlbumRepository,
  ) {}

  async execute(input: UpdateUserPhotoInput): Promise<UserPhoto> {
    if (input.albumId === undefined && input.description === undefined) {
      throw new BadRequestException("No photo fields provided to update");
    }

    const photo = await this.userPhotoRepository.findById(input.photoId);
    if (!photo) {
      throw new NotFoundException("Photo not found");
    }

    if (photo.ownerUserId !== input.ownerUserId) {
      throw new ForbiddenException("Only owner can update photo");
    }

    if (input.albumId !== undefined && input.albumId !== null) {
      const album = await this.userAlbumRepository.findByIdAndOwner(
        input.albumId,
        input.ownerUserId,
      );
      if (!album) {
        throw new BadRequestException("Album not found for user");
      }
    }

    return this.userPhotoRepository.updateById(input.photoId, {
      albumId: input.albumId,
      description:
        input.description === undefined
          ? undefined
          : input.description === null
            ? null
            : input.description.trim(),
    });
  }
}
