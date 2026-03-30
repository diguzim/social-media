export interface PostImage {
  id: string;
  mimeType: string;
  orderIndex: number;
  uploadedAt: Date;
}

export interface PostProps {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  images?: PostImage[];
}

export class Post {
  private readonly props: PostProps;

  constructor(props: PostProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get images(): PostImage[] {
    return this.props.images ?? [];
  }

  addImage(image: PostImage): void {
    if (!this.props.images) {
      this.props.images = [];
    }
    this.props.images.push(image);
  }

  removeImage(imageId: string): void {
    if (!this.props.images) return;
    this.props.images = this.props.images.filter((img) => img.id !== imageId);
    this.reorderImages();
  }

  reorderImages(newOrder?: string[]): void {
    if (!this.props.images) return;
    if (newOrder && newOrder.length === this.props.images.length) {
      const imageMap = new Map(this.props.images.map((img) => [img.id, img]));
      this.props.images = newOrder
        .map((id) => imageMap.get(id))
        .filter((img): img is PostImage => img !== undefined);
    }
    this.props.images.forEach((img, idx) => {
      img.orderIndex = idx;
    });
  }
}
