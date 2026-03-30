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
  images?: Array<{
    id: string;
    imageUrl: string;
    mimeType: string;
    orderIndex: number;
    uploadedAt: string;
  }>;
}
