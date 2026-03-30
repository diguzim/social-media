export interface CreatePostRequest {
  title: string;
  content: string;
  authorId: string;
  correlationId?: string;
}

export interface CreatePostReply {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  images?: Array<{
    id: string;
    mimeType: string;
    orderIndex: number;
    uploadedAt: string;
  }>;
}
