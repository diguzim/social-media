export interface GetPostsRequest {
  page?: number;
  limit?: number;
  authorId?: string;
  sortOrder?: "asc" | "desc";
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string; // ISO string
  images?: Array<{
    id: string;
    imageUrl: string;
    mimeType: string;
    orderIndex: number;
    uploadedAt: string;
  }>;
}

export interface GetPostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
