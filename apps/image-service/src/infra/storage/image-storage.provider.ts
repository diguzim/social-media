export interface SaveProfileImageInput {
  userId: string;
  fileBuffer: Buffer;
  originalName: string;
}

export interface SavePostImageInput {
  postId: string;
  userId: string;
  fileBuffer: Buffer;
  originalName: string;
}

export interface SaveUserPhotoInput {
  ownerUserId: string;
  fileBuffer: Buffer;
  originalName: string;
}

export abstract class ImageStorageProvider {
  abstract saveProfileImage(input: SaveProfileImageInput): Promise<string>;
  abstract readProfileImage(storagePath: string): Promise<Buffer>;
  abstract savePostImage(input: SavePostImageInput): Promise<string>;
  abstract readPostImage(storagePath: string): Promise<Buffer>;
  abstract saveUserPhoto(input: SaveUserPhotoInput): Promise<string>;
  abstract readUserPhoto(storagePath: string): Promise<Buffer>;
  abstract deleteFile(storagePath: string): Promise<void>;
}
