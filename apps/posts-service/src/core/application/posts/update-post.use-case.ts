import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PostRepository } from "src/core/domain/post/post.repository";

export interface UpdatePostInput {
  postId: string;
  authorId: string;
  title?: string;
  content?: string;
}

export interface UpdatePostOutput {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

@Injectable()
export class UpdatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: UpdatePostInput): Promise<UpdatePostOutput> {
    if (!input.title && !input.content) {
      throw new BadRequestException("Nothing to update");
    }

    const post = await this.postRepository.findById(input.postId);

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.authorId !== input.authorId) {
      throw new ForbiddenException("You cannot edit this post");
    }

    const updated = await this.postRepository.update({
      postId: input.postId,
      title: input.title,
      content: input.content,
    });

    return {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      authorId: updated.authorId,
      createdAt: updated.createdAt,
    };
  }
}
