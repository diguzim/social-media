import { NotFoundException } from "@nestjs/common";
import { GetPostUseCase } from "./get-post.use-case";
import { PostRepository } from "src/core/domain/post/post.repository";

describe("GetPostUseCase", () => {
  let postRepository: jest.Mocked<PostRepository>;

  beforeEach(() => {
    postRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };
  });

  it("should return a post when it exists", async () => {
    postRepository.findById.mockResolvedValue({
      id: "post-1",
      title: "Post title",
      content: "Post content",
      authorId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    });

    const useCase = new GetPostUseCase(postRepository);

    const result = await useCase.execute({ postId: "post-1" });

    expect(postRepository.findById).toHaveBeenCalledWith("post-1");
    expect(result).toEqual({
      id: "post-1",
      title: "Post title",
      content: "Post content",
      authorId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    });
  });

  it("should throw NotFoundException when post does not exist", async () => {
    postRepository.findById.mockResolvedValue(null);

    const useCase = new GetPostUseCase(postRepository);

    await expect(
      useCase.execute({ postId: "missing-id" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("should propagate repository errors", async () => {
    postRepository.findById.mockRejectedValue(new Error("db failure"));

    const useCase = new GetPostUseCase(postRepository);

    await expect(useCase.execute({ postId: "post-1" })).rejects.toThrow(
      "db failure",
    );
  });
});
