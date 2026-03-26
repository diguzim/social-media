import { Comment } from "./comment.entity";

export interface CreateCommentData {
  postId: string;
  authorId: string;
  content: string;
}

export interface UpdateCommentData {
  commentId: string;
  content: string;
}

export interface DeleteCommentData {
  commentId: string;
}

export interface FindCommentsOptions {
  postId: string;
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
}

export interface FindCommentsResult {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class CommentRepository {
  abstract create(createCommentData: CreateCommentData): Promise<Comment>;
  abstract findById(id: string): Promise<Comment | null>;
  abstract findMany(options: FindCommentsOptions): Promise<FindCommentsResult>;
  abstract update(updateCommentData: UpdateCommentData): Promise<Comment>;
  abstract delete(deleteCommentData: DeleteCommentData): Promise<void>;
}
