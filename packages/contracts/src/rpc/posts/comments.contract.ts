export interface CreateCommentRequest {
  postId: string;
  authorId: string;
  content: string;
  correlationId?: string;
}

export interface CreateCommentReply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetCommentsRequest {
  postId: string;
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
  correlationId?: string;
}

export interface GetCommentsCommentReply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetCommentsReply {
  data: GetCommentsCommentReply[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateCommentRequest {
  postId: string;
  commentId: string;
  authorId: string;
  content: string;
  correlationId?: string;
}

export interface UpdateCommentReply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DeleteCommentRequest {
  postId: string;
  commentId: string;
  authorId: string;
  correlationId?: string;
}

export interface DeleteCommentReply {
  success: boolean;
}
