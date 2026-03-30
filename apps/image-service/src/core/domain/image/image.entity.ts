export interface ImageProps {
  id: string;
  userId: string;
  postId?: string;
  mimeType: string;
  storagePath: string;
  orderIndex?: number;
  uploadedAt: Date;
}

export class Image {
  id: string;
  userId: string;
  postId?: string;
  mimeType: string;
  storagePath: string;
  orderIndex?: number;
  uploadedAt: Date;

  constructor(props: ImageProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.postId = props.postId;
    this.mimeType = props.mimeType;
    this.storagePath = props.storagePath;
    this.orderIndex = props.orderIndex;
    this.uploadedAt = props.uploadedAt;
  }
}
