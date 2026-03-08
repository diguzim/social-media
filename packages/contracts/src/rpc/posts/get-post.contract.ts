export interface GetPostRequest {
  postId: string;
  correlationId?: string;
}

export interface GetPostReply {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}
