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

  constructor() {
    this.seedReactions();
  }

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

  private seedReactions(): void {
    const seedData = [
      {
        id: "1",
        userId: "1",
        targetId: "1",
        targetType: "post" as const,
        reactionType: "like" as const,
        createdAt: new Date("2025-02-01T10:20:00"),
      },
      {
        id: "2",
        userId: "2",
        targetId: "1",
        targetType: "post" as const,
        reactionType: "like" as const,
        createdAt: new Date("2025-02-01T10:22:00"),
      },
      {
        id: "3",
        userId: "3",
        targetId: "2",
        targetType: "post" as const,
        reactionType: "like" as const,
        createdAt: new Date("2025-02-01T10:25:00"),
      },
      {
        id: "4",
        userId: "4",
        targetId: "6",
        targetType: "post" as const,
        reactionType: "like" as const,
        createdAt: new Date("2025-02-01T11:35:00"),
      },
      {
        id: "5",
        userId: "5",
        targetId: "6",
        targetType: "post" as const,
        reactionType: "like" as const,
        createdAt: new Date("2025-02-01T11:40:00"),
      },
      {
        id: "6",
        userId: "1",
        targetId: "10",
        targetType: "post" as const,
        reactionType: "like" as const,
        createdAt: new Date("2025-02-01T12:40:00"),
      },
      {
        id: "7",
        userId: "2",
        targetId: "23",
        targetType: "post" as const,
        reactionType: "like" as const,
        createdAt: new Date("2025-02-01T13:20:00"),
      },
      {
        id: "8",
        userId: "3",
        targetId: "23",
        targetType: "post" as const,
        reactionType: "like" as const,
        createdAt: new Date("2025-02-01T13:30:00"),
      },
      // Like on a post that does not exist (edge-case seed)
      {
        id: "9",
        userId: "1",
        targetId: "9999",
        targetType: "post" as const,
        reactionType: "like" as const,
        createdAt: new Date("2025-02-01T15:10:00"),
      },
    ];

    this.mergeSeedReactions(seedData);
  }

  private mergeSeedReactions(
    seedData: Array<{
      id: string;
      userId: string;
      targetId: string;
      targetType: "post";
      reactionType: "like";
      createdAt: Date;
    }>,
  ): void {
    seedData.forEach((data) => {
      const alreadyExists = this.reactions.some(
        (reaction) => reaction.id === data.id,
      );

      if (alreadyExists) {
        return;
      }

      this.reactions.push(
        new Reaction({
          id: data.id,
          userId: data.userId,
          targetId: data.targetId,
          targetType: data.targetType,
          reactionType: data.reactionType,
          createdAt: data.createdAt,
        }),
      );
    });
  }
}
