export interface ImageProps {
  id: string;
  userId: string;
  mimeType: string;
  storagePath: string;
  uploadedAt: Date;
}

export class Image {
  id: string;
  userId: string;
  mimeType: string;
  storagePath: string;
  uploadedAt: Date;

  constructor(props: ImageProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.mimeType = props.mimeType;
    this.storagePath = props.storagePath;
    this.uploadedAt = props.uploadedAt;
  }
}
