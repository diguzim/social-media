import { Injectable, NotFoundException } from "@nestjs/common";
import { PostRepository } from "src/core/domain/post/post.repository";

export interface GetPostInput {
  postId: string;
}

export interface GetPostOutput {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

@Injectable()
export class GetPostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: GetPostInput): Promise<GetPostOutput> {
    const post = await this.postRepository.findById(input.postId);

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt,
    };
  }
}
