export interface ReactionProps {
  id: string;
  userId: string;
  targetId: string;
  targetType: "post";
  reactionType: "like";
  createdAt: Date;
}

export class Reaction {
  private readonly props: ReactionProps;

  constructor(props: ReactionProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get targetId(): string {
    return this.props.targetId;
  }

  get targetType(): "post" {
    return this.props.targetType;
  }

  get reactionType(): "like" {
    return this.props.reactionType;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
