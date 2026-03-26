export interface UpdateCommentRequest {
  content: string;
}

export interface UpdateCommentResponse {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
