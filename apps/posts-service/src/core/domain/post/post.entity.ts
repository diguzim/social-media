export interface PostProps {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
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
}
