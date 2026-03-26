import { BadRequestException, Injectable } from "@nestjs/common";
import { CommentRepository } from "src/core/domain/comment/comment.repository";

export interface CreateCommentInput {
  postId: string;
  authorId: string;
  content: string;
}

export interface CreateCommentOutput {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

@Injectable()
export class CreateCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(input: CreateCommentInput): Promise<CreateCommentOutput> {
    const content = input.content.trim();
    if (!content) {
      throw new BadRequestException("Comment content is required");
    }

    const comment = await this.commentRepository.create({
      postId: input.postId,
      authorId: input.authorId,
      content,
    });

    return {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
