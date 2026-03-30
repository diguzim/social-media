import { Image } from "./image.entity";

export interface SaveProfileImageData {
  userId: string;
  mimeType: string;
  storagePath: string;
}

export abstract class ImageRepository {
  abstract saveProfileImage(data: SaveProfileImageData): Promise<Image>;
  abstract findProfileImageByUserId(userId: string): Promise<Image | null>;
}
