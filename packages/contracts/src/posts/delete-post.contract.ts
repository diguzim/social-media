export interface DeletePostRequest {
  postId: string;
  authorId: string;
  correlationId?: string;
}

export interface DeletePostReply {
  success: true;
}
