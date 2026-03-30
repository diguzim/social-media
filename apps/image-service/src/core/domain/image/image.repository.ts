import { Image } from "./image.entity";

export interface SaveProfileImageData {
  userId: string;
  mimeType: string;
  storagePath: string;
}

export interface SavePostImageData {
  postId: string;
  userId: string;
  mimeType: string;
  storagePath: string;
  orderIndex: number;
}

export abstract class ImageRepository {
  abstract saveProfileImage(data: SaveProfileImageData): Promise<Image>;
  abstract findProfileImageByUserId(userId: string): Promise<Image | null>;
  abstract savePostImage(data: SavePostImageData): Promise<Image>;
  abstract findPostImageById(
    postId: string,
    imageId: string,
  ): Promise<Image | null>;
  abstract findPostImagesByPostId(postId: string): Promise<Image[]>;
  abstract deletePostImage(postId: string, imageId: string): Promise<void>;
  abstract reorderPostImages(
    postId: string,
    imageOrder: string[],
  ): Promise<void>;
}
