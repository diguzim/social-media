const API_BASE_URL = 'http://localhost:4000';

export type SortOrder = 'asc' | 'desc';

export interface GetPostsRequest {
  page?: number;
  limit?: number;
  authorId?: string;
  sortOrder?: SortOrder;
}

export interface FeedPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface GetPostsResponse {
  data: FeedPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getPosts(params: GetPostsRequest = {}): Promise<GetPostsResponse> {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.authorId) query.set('authorId', params.authorId);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  const endpoint = `${API_BASE_URL}/posts${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
}
