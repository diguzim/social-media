import { Injectable } from "@nestjs/common";
import { ReactionRepository } from "src/core/domain/reaction/reaction.repository";

export interface ToggleReactionInput {
  userId: string;
  targetId: string;
  targetType: "post";
  reactionType: "like";
}

export interface ToggleReactionOutput {
  reactionId?: string;
  targetId: string;
  reactionType: "like";
  targetType: "post";
  isAdded: boolean;
}

@Injectable()
export class ToggleReactionUseCase {
  constructor(private readonly reactionRepository: ReactionRepository) {}

  async execute(input: ToggleReactionInput): Promise<ToggleReactionOutput> {
    // Find if user already reacted
    const existingReaction = await this.reactionRepository.findUserReaction({
      userId: input.userId,
      targetId: input.targetId,
      targetType: input.targetType,
      reactionType: input.reactionType,
    });

    if (existingReaction) {
      // Remove reaction
      await this.reactionRepository.deleteById(existingReaction.id);
      return {
        targetId: input.targetId,
        reactionType: input.reactionType,
        targetType: input.targetType,
        isAdded: false,
      };
    } else {
      // Add reaction
      const reaction = await this.reactionRepository.create({
        userId: input.userId,
        targetId: input.targetId,
        targetType: input.targetType,
        reactionType: input.reactionType,
      });

      return {
        reactionId: reaction.id,
        targetId: reaction.targetId,
        reactionType: reaction.reactionType,
        targetType: reaction.targetType,
        isAdded: true,
      };
    }
  }
}
