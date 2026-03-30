export interface FeedPostAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface FeedPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: FeedPostAuthor;
  createdAt: string;
  reactions?: {
    likeCount: number;
    likedByMe: boolean;
  };
  images?: Array<{
    id: string;
    imageUrl: string;
    mimeType: string;
    orderIndex: number;
    uploadedAt: string;
  }>;
}

export interface GetFeedRequest {
  page?: number;
  limit?: number;
  authorId?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetFeedResponse {
  data: FeedPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
