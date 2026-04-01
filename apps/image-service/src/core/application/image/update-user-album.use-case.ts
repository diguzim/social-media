import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserAlbum } from "src/core/domain/image/user-album.entity";
import { UserAlbumRepository } from "src/core/domain/image/user-album.repository";

interface UpdateUserAlbumInput {
  ownerUserId: string;
  albumId: string;
  name?: string;
  description?: string | null;
}

@Injectable()
export class UpdateUserAlbumUseCase {
  constructor(private readonly userAlbumRepository: UserAlbumRepository) {}

  async execute(input: UpdateUserAlbumInput): Promise<UserAlbum> {
    if (input.name === undefined && input.description === undefined) {
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

    return this.userAlbumRepository.updateById(input.albumId, {
      name: normalizedName,
      description:
        input.description === undefined
          ? undefined
          : input.description === null
            ? null
            : input.description.trim(),
    });
  }
}
