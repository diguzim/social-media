export interface UserPhotoProps {
  id: string;
  ownerUserId: string;
  albumId?: string | null;
  description?: string | null;
  mimeType: string;
  storagePath: string;
  uploadedAt: Date;
  updatedAt?: Date | null;
}

export class UserPhoto {
  id: string;
  ownerUserId: string;
  albumId: string | null;
  description: string | null;
  mimeType: string;
  storagePath: string;
  uploadedAt: Date;
  updatedAt: Date | null;

  constructor(props: UserPhotoProps) {
    this.id = props.id;
    this.ownerUserId = props.ownerUserId;
    this.albumId = props.albumId ?? null;
    this.description = props.description ?? null;
    this.mimeType = props.mimeType;
    this.storagePath = props.storagePath;
    this.uploadedAt = props.uploadedAt;
    this.updatedAt = props.updatedAt ?? null;
  }
}
