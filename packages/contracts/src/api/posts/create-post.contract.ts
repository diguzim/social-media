export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface CreatePostResponse {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}
