import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { DeleteCommentUseCase } from "./delete-comment.use-case";
import { CommentRepository } from "src/core/domain/comment/comment.repository";

describe("DeleteCommentUseCase", () => {
  let commentRepository: jest.Mocked<CommentRepository>;

  beforeEach(() => {
    commentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  });

  it("should delete own comment", async () => {
    commentRepository.findById.mockResolvedValue({
      id: "c1",
      postId: "p1",
      authorId: "u1",
      content: "Comment",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: undefined,
    });

    const useCase = new DeleteCommentUseCase(commentRepository);

    await useCase.execute({
      postId: "p1",
      commentId: "c1",
      authorId: "u1",
    });

    expect(commentRepository.delete).toHaveBeenCalledWith({ commentId: "c1" });
  });

  it("should throw NotFoundException when comment does not exist", async () => {
    commentRepository.findById.mockResolvedValue(null);

    const useCase = new DeleteCommentUseCase(commentRepository);
    await expect(
      useCase.execute({
        postId: "p1",
        commentId: "c1",
        authorId: "u1",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("should throw ForbiddenException when user is not owner", async () => {
    commentRepository.findById.mockResolvedValue({
      id: "c1",
      postId: "p1",
      authorId: "u1",
      content: "Comment",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: undefined,
    });

    const useCase = new DeleteCommentUseCase(commentRepository);
    await expect(
      useCase.execute({
        postId: "p1",
        commentId: "c1",
        authorId: "u2",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
