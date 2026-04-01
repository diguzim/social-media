import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserAlbumRepository } from "src/core/domain/image/user-album.repository";
import { UserPhotoRepository } from "src/core/domain/image/user-photo.repository";

interface DeleteUserAlbumInput {
  ownerUserId: string;
  albumId: string;
}

@Injectable()
export class DeleteUserAlbumUseCase {
  constructor(
    private readonly userAlbumRepository: UserAlbumRepository,
    private readonly userPhotoRepository: UserPhotoRepository,
  ) {}

  async execute(input: DeleteUserAlbumInput): Promise<void> {
    const album = await this.userAlbumRepository.findById(input.albumId);
    if (!album) {
      throw new NotFoundException("Album not found");
    }

    if (album.ownerUserId !== input.ownerUserId) {
      throw new ForbiddenException("Only owner can delete album");
    }

    await this.userPhotoRepository.clearAlbumByAlbumId(input.albumId);
    await this.userAlbumRepository.deleteById(input.albumId);
  }
}
