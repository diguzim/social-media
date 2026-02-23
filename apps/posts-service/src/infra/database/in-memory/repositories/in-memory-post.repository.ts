import { Injectable } from "@nestjs/common";
import { Post } from "src/core/domain/post/post.entity";
import {
  PostRepository,
  CreatePostData,
} from "src/core/domain/post/post.repository";

@Injectable()
export class InMemoryPostRepository implements PostRepository {
  private posts: Post[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(createPostData: CreatePostData): Promise<Post> {
    const post = new Post({
      id: (this.posts.length + 1).toString(),
      title: createPostData.title,
      content: createPostData.content,
      authorId: createPostData.authorId,
      createdAt: new Date(),
    });

    this.posts.push(post);

    return post;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: string): Promise<Post | null> {
    const post = this.posts.find((item) => item.id === id);
    return post ?? null;
  }
}
