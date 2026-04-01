import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserPhotoRepository } from "src/core/domain/image/user-photo.repository";
import { ImageStorageProvider } from "src/infra/storage/image-storage.provider";

interface DeleteUserPhotoInput {
  ownerUserId: string;
  photoId: string;
}

@Injectable()
export class DeleteUserPhotoUseCase {
  constructor(
    private readonly userPhotoRepository: UserPhotoRepository,
    @Inject(ImageStorageProvider)
    private readonly imageStorageProvider: ImageStorageProvider,
  ) {}

  async execute(input: DeleteUserPhotoInput): Promise<void> {
    const photo = await this.userPhotoRepository.findById(input.photoId);
    if (!photo) {
      throw new NotFoundException("Photo not found");
    }

    if (photo.ownerUserId !== input.ownerUserId) {
      throw new ForbiddenException("Only owner can delete photo");
    }

    await this.userPhotoRepository.deleteById(input.photoId);
    await this.imageStorageProvider.deleteFile(photo.storagePath);
  }
}
