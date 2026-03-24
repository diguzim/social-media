import { Reaction } from "./reaction.entity";

export interface CreateReactionData {
  userId: string;
  targetId: string;
  targetType: "post";
  reactionType: "like";
}

export interface FindUserReactionOptions {
  userId: string;
  targetId: string;
  targetType: "post";
  reactionType: "like";
}

export interface ReactionSummary {
  targetId: string;
  reactionType: "like";
  count: number;
  reactedByCurrentUser?: boolean;
}

export abstract class ReactionRepository {
  abstract create(createReactionData: CreateReactionData): Promise<Reaction>;
  abstract findUserReaction(
    options: FindUserReactionOptions,
  ): Promise<Reaction | null>;
  abstract deleteById(id: string): Promise<void>;
  abstract countByTarget(
    targetId: string,
    targetType: "post",
    reactionType: "like",
  ): Promise<number>;
  abstract getReactionSummaryByTargets(
    targetIds: string[],
    targetType: "post",
    reactionType: "like",
    userId?: string,
  ): Promise<ReactionSummary[]>;
}
