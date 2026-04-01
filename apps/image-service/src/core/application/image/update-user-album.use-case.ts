import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserAlbum } from "src/core/domain/image/user-album.entity";
import { UserAlbumRepository } from "src/core/domain/image/user-album.repository";
import { UserPhotoRepository } from "src/core/domain/image/user-photo.repository";

interface UpdateUserAlbumInput {
  ownerUserId: string;
  albumId: string;
  name?: string;
  description?: string | null;
  coverPhotoId?: string | null;
}

@Injectable()
export class UpdateUserAlbumUseCase {
  constructor(
    private readonly userAlbumRepository: UserAlbumRepository,
    private readonly userPhotoRepository: UserPhotoRepository,
  ) {}

  async execute(input: UpdateUserAlbumInput): Promise<UserAlbum> {
    if (
      input.name === undefined &&
      input.description === undefined &&
      input.coverPhotoId === undefined
    ) {
      throw new BadRequestException("No album fields provided to update");
    }

    const album = await this.userAlbumRepository.findById(input.albumId);
    if (!album) {
      throw new NotFoundException("Album not found");
    }

    if (album.ownerUserId !== input.ownerUserId) {
      throw new ForbiddenException("Only owner can update album");
    }

    const normalizedName =
      input.name !== undefined ? input.name.trim() : undefined;
    if (normalizedName !== undefined && !normalizedName) {
      throw new BadRequestException("Album name cannot be empty");
    }

    let normalizedCoverPhotoId: string | null | undefined = undefined;
    if (input.coverPhotoId !== undefined) {
      if (input.coverPhotoId === null) {
        normalizedCoverPhotoId = null;
      } else {
        const normalized = input.coverPhotoId.trim();
        if (!normalized) {
          throw new BadRequestException("Cover photo id cannot be empty");
        }

        const coverPhoto = await this.userPhotoRepository.findByIdAndOwner(
          normalized,
          input.ownerUserId,
        );
        if (!coverPhoto) {
          throw new BadRequestException(
            "Cover photo not found for album owner",
          );
        }

        if (coverPhoto.albumId !== input.albumId) {
          throw new BadRequestException(
            "Cover photo must belong to the same album",
          );
        }

        normalizedCoverPhotoId = normalized;
      }
    }

    return this.userAlbumRepository.updateById(input.albumId, {
      name: normalizedName,
      description:
        input.description === undefined
          ? undefined
          : input.description === null
            ? null
            : input.description.trim(),
      coverPhotoId: normalizedCoverPhotoId,
    });
  }
}
