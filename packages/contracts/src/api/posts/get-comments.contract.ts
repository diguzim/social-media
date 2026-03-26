export interface GetCommentsRequest {
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetCommentsResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
