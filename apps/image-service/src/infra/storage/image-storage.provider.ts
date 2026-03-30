export interface SaveProfileImageInput {
  userId: string;
  fileBuffer: Buffer;
  originalName: string;
}

export abstract class ImageStorageProvider {
  abstract saveProfileImage(input: SaveProfileImageInput): Promise<string>;
}
