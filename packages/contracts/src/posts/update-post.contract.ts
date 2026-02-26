export interface UpdatePostRequest {
  postId: string;
  title?: string;
  content?: string;
  authorId: string;
  correlationId?: string;
}

export interface UpdatePostReply {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}
