export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface UpdatePostResponse {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}
