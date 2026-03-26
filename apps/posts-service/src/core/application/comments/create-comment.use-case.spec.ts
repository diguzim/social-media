import { BadRequestException } from "@nestjs/common";
import { CreateCommentUseCase } from "./create-comment.use-case";
import { CommentRepository } from "src/core/domain/comment/comment.repository";

describe("CreateCommentUseCase", () => {
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

  it("should create a comment with trimmed content", async () => {
    commentRepository.create.mockResolvedValue({
      id: "c1",
      postId: "p1",
      authorId: "u1",
      content: "Hello",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: undefined,
    });

    const useCase = new CreateCommentUseCase(commentRepository);

    const result = await useCase.execute({
      postId: "p1",
      authorId: "u1",
      content: "  Hello  ",
    });

    expect(commentRepository.create).toHaveBeenCalledWith({
      postId: "p1",
      authorId: "u1",
      content: "Hello",
    });
    expect(result.id).toBe("c1");
  });

  it("should throw BadRequestException when content is empty", async () => {
    const useCase = new CreateCommentUseCase(commentRepository);

    await expect(
      useCase.execute({
        postId: "p1",
        authorId: "u1",
        content: "   ",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
