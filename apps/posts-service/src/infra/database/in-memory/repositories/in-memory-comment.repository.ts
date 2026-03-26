import { Injectable } from "@nestjs/common";
import { Comment } from "src/core/domain/comment/comment.entity";
import {
  CommentRepository,
  CreateCommentData,
  DeleteCommentData,
  FindCommentsOptions,
  FindCommentsResult,
  UpdateCommentData,
} from "src/core/domain/comment/comment.repository";

@Injectable()
export class InMemoryCommentRepository implements CommentRepository {
  private comments: Comment[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(createCommentData: CreateCommentData): Promise<Comment> {
    const comment = new Comment({
      id: (this.comments.length + 1).toString(),
      postId: createCommentData.postId,
      authorId: createCommentData.authorId,
      content: createCommentData.content,
      createdAt: new Date(),
    });

    this.comments.push(comment);
    return comment;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: string): Promise<Comment | null> {
    const comment = this.comments.find((item) => item.id === id);
    return comment ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findMany(options: FindCommentsOptions): Promise<FindCommentsResult> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const sortOrder = options.sortOrder ?? "asc";

    const filtered = this.comments.filter(
      (comment) => comment.postId === options.postId,
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === "desc") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const total = sorted.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: sorted.slice(start, end),
      total,
      page,
      limit,
      totalPages,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async update(updateCommentData: UpdateCommentData): Promise<Comment> {
    const index = this.comments.findIndex(
      (item) => item.id === updateCommentData.commentId,
    );

    if (index === -1) {
      throw new Error("Comment not found");
    }

    const current = this.comments[index];
    if (!current) {
      throw new Error("Comment not found");
    }

    const updated = new Comment({
      id: current.id,
      postId: current.postId,
      authorId: current.authorId,
      content: updateCommentData.content,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    });

    this.comments[index] = updated;
    return updated;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async delete(deleteCommentData: DeleteCommentData): Promise<void> {
    const index = this.comments.findIndex(
      (item) => item.id === deleteCommentData.commentId,
    );

    if (index === -1) {
      throw new Error("Comment not found");
    }

    this.comments.splice(index, 1);
  }
}
