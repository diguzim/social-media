import { BadRequestException, Injectable } from "@nestjs/common";
import { UserAlbum } from "src/core/domain/image/user-album.entity";
import { UserAlbumRepository } from "src/core/domain/image/user-album.repository";

interface CreateUserAlbumInput {
  ownerUserId: string;
  name: string;
  description?: string;
}

@Injectable()
export class CreateUserAlbumUseCase {
  constructor(private readonly userAlbumRepository: UserAlbumRepository) {}

  async execute(input: CreateUserAlbumInput): Promise<UserAlbum> {
    const name = input.name.trim();
    if (!name) {
      throw new BadRequestException("Album name is required");
    }

    return this.userAlbumRepository.create({
      ownerUserId: input.ownerUserId,
      name,
      description: input.description?.trim() || undefined,
    });
  }
}
