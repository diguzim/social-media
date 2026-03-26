export interface CreateCommentRequest {
  content: string;
}

export interface CreateCommentResponse {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
