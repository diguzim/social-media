import { Injectable } from "@nestjs/common";
import { ReactionRepository } from "src/core/domain/reaction/reaction.repository";

export interface GetReactionSummaryBatchInput {
  targetIds: string[];
  targetType: "post";
  userId?: string;
}

export interface ReactionSummaryItem {
  targetId: string;
  reactionType: "like";
  count: number;
  reactedByCurrentUser?: boolean;
}

export interface GetReactionSummaryBatchOutput {
  summaries: ReactionSummaryItem[];
}

@Injectable()
export class GetReactionSummaryBatchUseCase {
  constructor(private readonly reactionRepository: ReactionRepository) {}

  async execute(
    input: GetReactionSummaryBatchInput,
  ): Promise<GetReactionSummaryBatchOutput> {
    const summaries = await this.reactionRepository.getReactionSummaryByTargets(
      input.targetIds,
      input.targetType,
      "like",
      input.userId,
    );

    return {
      summaries: summaries.map((s) => ({
        targetId: s.targetId,
        reactionType: s.reactionType,
        count: s.count,
        reactedByCurrentUser: s.reactedByCurrentUser,
      })),
    };
  }
}
