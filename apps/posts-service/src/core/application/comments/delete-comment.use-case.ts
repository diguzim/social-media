import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommentRepository } from "src/core/domain/comment/comment.repository";

export interface DeleteCommentInput {
  postId: string;
  commentId: string;
  authorId: string;
}

@Injectable()
export class DeleteCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(input: DeleteCommentInput): Promise<void> {
    const comment = await this.commentRepository.findById(input.commentId);
    if (!comment || comment.postId !== input.postId) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.authorId !== input.authorId) {
      throw new ForbiddenException("You cannot delete this comment");
    }

    await this.commentRepository.delete({ commentId: input.commentId });
  }
}
