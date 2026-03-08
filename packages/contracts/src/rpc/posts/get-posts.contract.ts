export interface GetPostsRequest {
  page?: number;
  limit?: number;
  authorId?: string;
  sortOrder?: "asc" | "desc";
  correlationId?: string;
}

export interface GetPostsPostReply {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string; // ISO string
}

export interface GetPostsReply {
  data: GetPostsPostReply[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
