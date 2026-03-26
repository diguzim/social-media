import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommentRepository } from "src/core/domain/comment/comment.repository";

export interface UpdateCommentInput {
  postId: string;
  commentId: string;
  authorId: string;
  content: string;
}

export interface UpdateCommentOutput {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

@Injectable()
export class UpdateCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(input: UpdateCommentInput): Promise<UpdateCommentOutput> {
    const content = input.content.trim();
    if (!content) {
      throw new BadRequestException("Comment content is required");
    }

    const comment = await this.commentRepository.findById(input.commentId);
    if (!comment || comment.postId !== input.postId) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.authorId !== input.authorId) {
      throw new ForbiddenException("You cannot edit this comment");
    }

    const updated = await this.commentRepository.update({
      commentId: input.commentId,
      content,
    });

    return {
      id: updated.id,
      postId: updated.postId,
      authorId: updated.authorId,
      content: updated.content,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
