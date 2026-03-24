import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { DeletePostUseCase } from "./delete-post.use-case";
import { PostRepository } from "src/core/domain/post/post.repository";

describe("DeletePostUseCase", () => {
  let postRepository: jest.Mocked<PostRepository>;

  beforeEach(() => {
    postRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  });

  it("should delete a post when authorized", async () => {
    postRepository.findById.mockResolvedValue({
      id: "post-1",
      title: "Old title",
      content: "Old content",
      authorId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    });

    const useCase = new DeletePostUseCase(postRepository);

    await useCase.execute({
      postId: "post-1",
      authorId: "user-1",
    });

    expect(postRepository.findById.mock.calls).toEqual([["post-1"]]);
    expect(postRepository.delete.mock.calls).toEqual([[{ postId: "post-1" }]]);
  });

  it("should throw NotFoundException when post does not exist", async () => {
    postRepository.findById.mockResolvedValue(null);

    const useCase = new DeletePostUseCase(postRepository);

    await expect(
      useCase.execute({ postId: "missing-id", authorId: "user-1" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("should throw ForbiddenException when author does not match", async () => {
    postRepository.findById.mockResolvedValue({
      id: "post-1",
      title: "Old title",
      content: "Old content",
      authorId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    });

    const useCase = new DeletePostUseCase(postRepository);

    await expect(
      useCase.execute({ postId: "post-1", authorId: "user-2" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("should propagate repository errors", async () => {
    postRepository.findById.mockRejectedValue(new Error("db failure"));

    const useCase = new DeletePostUseCase(postRepository);

    await expect(
      useCase.execute({ postId: "post-1", authorId: "user-1" }),
    ).rejects.toThrow("db failure");
  });
});
