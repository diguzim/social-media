import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { UpdateCommentUseCase } from "./update-comment.use-case";
import { CommentRepository } from "src/core/domain/comment/comment.repository";

describe("UpdateCommentUseCase", () => {
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

  it("should update own comment", async () => {
    const createdAt = new Date("2026-01-01T00:00:00Z");
    const updatedAt = new Date("2026-01-02T00:00:00Z");

    commentRepository.findById.mockResolvedValue({
      id: "c1",
      postId: "p1",
      authorId: "u1",
      content: "Old",
      createdAt,
      updatedAt: undefined,
    });
    commentRepository.update.mockResolvedValue({
      id: "c1",
      postId: "p1",
      authorId: "u1",
      content: "New",
      createdAt,
      updatedAt,
    });

    const useCase = new UpdateCommentUseCase(commentRepository);
    const result = await useCase.execute({
      postId: "p1",
      commentId: "c1",
      authorId: "u1",
      content: " New ",
    });

    expect(commentRepository.update).toHaveBeenCalledWith({
      commentId: "c1",
      content: "New",
    });
    expect(result.updatedAt).toEqual(updatedAt);
  });

  it("should throw BadRequestException for empty content", async () => {
    const useCase = new UpdateCommentUseCase(commentRepository);
    await expect(
      useCase.execute({
        postId: "p1",
        commentId: "c1",
        authorId: "u1",
        content: "  ",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("should throw NotFoundException when comment does not exist", async () => {
    commentRepository.findById.mockResolvedValue(null);

    const useCase = new UpdateCommentUseCase(commentRepository);
    await expect(
      useCase.execute({
        postId: "p1",
        commentId: "c1",
        authorId: "u1",
        content: "New",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("should throw ForbiddenException when user is not owner", async () => {
    commentRepository.findById.mockResolvedValue({
      id: "c1",
      postId: "p1",
      authorId: "u1",
      content: "Old",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: undefined,
    });

    const useCase = new UpdateCommentUseCase(commentRepository);
    await expect(
      useCase.execute({
        postId: "p1",
        commentId: "c1",
        authorId: "u2",
        content: "New",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
