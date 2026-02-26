import { Post } from "./post.entity";

export interface CreatePostData {
  title: string;
  content: string;
  authorId: string;
}

export interface UpdatePostData {
  postId: string;
  title?: string;
  content?: string;
}

export interface DeletePostData {
  postId: string;
}

export interface FindPostsOptions {
  page?: number; // 1-indexed, defaults to 1
  limit?: number; // defaults to 10
  authorId?: string; // optional filter
  sortBy?: "createdAt"; // defaults to createdAt
  sortOrder?: "asc" | "desc"; // defaults to desc (newer first)
}

export interface FindPostsResult {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class PostRepository {
  abstract create(createPostData: CreatePostData): Promise<Post>;
  abstract findById(id: string): Promise<Post | null>;
  abstract update(updatePostData: UpdatePostData): Promise<Post>;
  abstract delete(deletePostData: DeletePostData): Promise<void>;
  abstract findMany(options: FindPostsOptions): Promise<FindPostsResult>;
}
