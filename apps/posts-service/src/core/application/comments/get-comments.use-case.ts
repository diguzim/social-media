import { Injectable } from "@nestjs/common";
import { CommentRepository } from "src/core/domain/comment/comment.repository";

export interface GetCommentsInput {
  postId: string;
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
}

export interface GetCommentsCommentOutput {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetCommentsOutput {
  data: GetCommentsCommentOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GetCommentsUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(input: GetCommentsInput): Promise<GetCommentsOutput> {
    const result = await this.commentRepository.findMany({
      postId: input.postId,
      page: input.page,
      limit: input.limit,
      sortOrder: input.sortOrder,
    });

    return {
      data: result.data.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
