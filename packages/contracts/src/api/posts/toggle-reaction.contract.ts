export interface ToggleReactionRequest {
  reactionType: "like";
}

export interface ToggleReactionResponse {
  reactionId?: string;
  targetId: string;
  reactionType: "like";
  targetType: "post";
  isAdded: boolean;
}
