import { Injectable } from "@nestjs/common";
import { PostRepository } from "src/core/domain/post/post.repository";

export interface GetPostsInput {
  page?: number;
  limit?: number;
  authorId?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetPostsPostOutput {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

export interface GetPostsOutput {
  data: GetPostsPostOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GetPostsUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: GetPostsInput): Promise<GetPostsOutput> {
    const result = await this.postRepository.findMany({
      page: input.page,
      limit: input.limit,
      authorId: input.authorId,
      sortOrder: input.sortOrder,
    });

    return {
      data: result.data.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        createdAt: post.createdAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
