import type { PostImage } from '@repo/contracts/api';

export interface ExistingEditableImage {
  kind: 'existing';
  key: string;
  id: string;
  imageUrl: string;
  mimeType: string;
  uploadedAt: string;
}

export interface NewEditableImage {
  kind: 'new';
  key: string;
  file: File;
  imageUrl: string;
}

export type EditableImage = ExistingEditableImage | NewEditableImage;

export const MAX_POST_IMAGES = 10;
export const MAX_POST_IMAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_POST_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif']);

export const sortPostImages = (images: PostImage[] | undefined): PostImage[] => {
  if (!images) {
    return [];
  }

  return [...images].sort((a, b) => a.orderIndex - b.orderIndex);
};
