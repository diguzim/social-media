import { Injectable } from "@nestjs/common";
import { Reaction } from "src/core/domain/reaction/reaction.entity";
import {
  ReactionRepository,
  CreateReactionData,
  FindUserReactionOptions,
  ReactionSummary,
} from "src/core/domain/reaction/reaction.repository";

@Injectable()
export class InMemoryReactionRepository implements ReactionRepository {
  private reactions: Reaction[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(createReactionData: CreateReactionData): Promise<Reaction> {
    const reaction = new Reaction({
      id: (this.reactions.length + 1).toString(),
      userId: createReactionData.userId,
      targetId: createReactionData.targetId,
      targetType: createReactionData.targetType,
      reactionType: createReactionData.reactionType,
      createdAt: new Date(),
    });

    this.reactions.push(reaction);
    return reaction;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findUserReaction(
    options: FindUserReactionOptions,
  ): Promise<Reaction | null> {
    const reaction = this.reactions.find(
      (r) =>
        r.userId === options.userId &&
        r.targetId === options.targetId &&
        r.targetType === options.targetType &&
        r.reactionType === options.reactionType,
    );

    return reaction ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async deleteById(id: string): Promise<void> {
    const index = this.reactions.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error("Reaction not found");
    }

    this.reactions.splice(index, 1);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async countByTarget(
    targetId: string,
    targetType: "post",
    reactionType: "like",
  ): Promise<number> {
    return this.reactions.filter(
      (r) =>
        r.targetId === targetId &&
        r.targetType === targetType &&
        r.reactionType === reactionType,
    ).length;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getReactionSummaryByTargets(
    targetIds: string[],
    targetType: "post",
    reactionType: "like",
    userId?: string,
  ): Promise<ReactionSummary[]> {
    return targetIds.map((targetId) => {
      const count = this.reactions.filter(
        (r) =>
          r.targetId === targetId &&
          r.targetType === targetType &&
          r.reactionType === reactionType,
      ).length;

      const userReacted = userId
        ? this.reactions.some(
            (r) =>
              r.userId === userId &&
              r.targetId === targetId &&
              r.targetType === targetType &&
              r.reactionType === reactionType,
          )
        : false;

      return {
        targetId,
        reactionType,
        count,
        reactedByCurrentUser: userReacted,
      };
    });
  }
}
