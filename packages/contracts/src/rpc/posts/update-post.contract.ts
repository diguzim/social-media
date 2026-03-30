export interface UpdatePostRequest {
  postId: string;
  title?: string;
  content?: string;
  images?: Array<{
    id: string;
    mimeType: string;
    orderIndex: number;
    uploadedAt: string;
  }>;
  authorId: string;
  correlationId?: string;
}

export interface UpdatePostReply {
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
