import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PostRepository } from "src/core/domain/post/post.repository";

export interface DeletePostInput {
  postId: string;
  authorId: string;
}

@Injectable()
export class DeletePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: DeletePostInput): Promise<void> {
    const post = await this.postRepository.findById(input.postId);

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.authorId !== input.authorId) {
      throw new ForbiddenException("You cannot delete this post");
    }

    await this.postRepository.delete({ postId: input.postId });
  }
}
