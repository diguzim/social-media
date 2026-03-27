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

  constructor() {
    this.seedComments();
  }

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

  private seedComments(): void {
    const seedData = [
      {
        id: "1",
        postId: "1",
        authorId: "2",
        content: "Great introduction. I use TypeScript daily.",
        createdAt: new Date("2025-02-01T10:00:00"),
      },
      {
        id: "2",
        postId: "1",
        authorId: "3",
        content: "Nice tips, especially around strict mode.",
        createdAt: new Date("2025-02-01T10:05:00"),
      },
      {
        id: "3",
        postId: "6",
        authorId: "1",
        content: "Clean code examples here are solid.",
        createdAt: new Date("2025-02-01T11:10:00"),
      },
      {
        id: "4",
        postId: "10",
        authorId: "4",
        content: "This monitoring post aged very well.",
        createdAt: new Date("2025-02-01T12:30:00"),
      },
      {
        id: "5",
        postId: "23",
        authorId: "1",
        content: "Comment on post with unknown author for fallback testing.",
        createdAt: new Date("2025-02-01T13:15:00"),
      },
      {
        id: "6",
        postId: "2",
        authorId: "5",
        content: "Async/await still wins for readability.",
        createdAt: new Date("2025-02-01T14:20:00"),
      },
      // Comment referencing a post that does not exist.
      // Useful for edge-case tests where linked resources are missing.
      {
        id: "7",
        postId: "9999",
        authorId: "2",
        content: "Ghost thread comment used in missing-resource scenarios.",
        createdAt: new Date("2025-02-01T15:00:00"),
      },
    ];

    this.mergeSeedComments(seedData);
  }

  private mergeSeedComments(
    seedData: Array<{
      id: string;
      postId: string;
      authorId: string;
      content: string;
      createdAt: Date;
    }>,
  ): void {
    seedData.forEach((data) => {
      const alreadyExists = this.comments.some(
        (comment) => comment.id === data.id,
      );

      if (alreadyExists) {
        return;
      }

      this.comments.push(
        new Comment({
          id: data.id,
          postId: data.postId,
          authorId: data.authorId,
          content: data.content,
          createdAt: data.createdAt,
        }),
      );
    });
  }
}
