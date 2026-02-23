import { Post } from "./post.entity";

export interface CreatePostData {
  title: string;
  content: string;
  authorId: string;
}

export abstract class PostRepository {
  abstract create(createPostData: CreatePostData): Promise<Post>;
  abstract findById(id: string): Promise<Post | null>;
}
