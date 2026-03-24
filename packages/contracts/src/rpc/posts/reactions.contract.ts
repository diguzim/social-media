export interface ToggleReactionRequest {
  userId: string;
  targetId: string;
  targetType: "post";
  reactionType: "like";
  correlationId?: string;
}

export interface ToggleReactionReply {
  reactionId?: string;
  targetId: string;
  reactionType: "like";
  targetType: "post";
  isAdded: boolean;
}

export interface GetReactionSummaryBatchRequest {
  targetIds: string[];
  targetType: "post";
  userId?: string; // If provided, includes whether current user reacted
  correlationId?: string;
}

export interface ReactionSummary {
  targetId: string;
  reactionType: "like";
  count: number;
  reactedByCurrentUser?: boolean;
}

export interface GetReactionSummaryBatchReply {
  summaries: ReactionSummary[];
}
