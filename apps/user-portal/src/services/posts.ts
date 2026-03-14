import type {
  GetPostsRequest,
  GetPostsResponse,
  Post,
  GetFeedRequest,
  GetFeedResponse,
  FeedPost as ApiFeedPost,
  CreatePostRequest,
  CreatePostResponse,
} from '@repo/contracts/api';

const API_BASE_URL = 'http://localhost:4000';

export type FeedPost = Post | ApiFeedPost;

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

export async function getFeed(params: GetFeedRequest = {}): Promise<GetFeedResponse> {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.authorId) query.set('authorId', params.authorId);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  const endpoint = `${API_BASE_URL}/posts/feed${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch feed');
  }

  return response.json();
}

export async function createPost(data: CreatePostRequest): Promise<CreatePostResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create post');
  }

  return response.json();
}
