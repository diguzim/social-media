import type { GetPostsRequest, GetPostsResponse, Post } from '@repo/contracts/api';

const API_BASE_URL = 'http://localhost:4000';

export type FeedPost = Post;

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
