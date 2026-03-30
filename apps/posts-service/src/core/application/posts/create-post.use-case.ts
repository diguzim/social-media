import { Injectable } from "@nestjs/common";
import { PostRepository } from "src/core/domain/post/post.repository";

export interface CreatePostInput {
  title: string;
  content: string;
  authorId: string;
}

export interface CreatePostOutput {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  images: Array<{
    id: string;
    mimeType: string;
    orderIndex: number;
    uploadedAt: Date;
  }>;
}

@Injectable()
export class CreatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: CreatePostInput): Promise<CreatePostOutput> {
    const post = await this.postRepository.create({
      title: input.title,
      content: input.content,
      authorId: input.authorId,
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt,
      images: post.images,
    };
  }
}
