import { CreatePostUseCase } from "./create-post.use-case";
import { PostRepository } from "src/core/domain/post/post.repository";

describe("CreatePostUseCase", () => {
  let postRepository: jest.Mocked<PostRepository>;

  beforeEach(() => {
    postRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };
  });

  it("should create a post and return output", async () => {
    postRepository.create.mockResolvedValue({
      id: "post-1",
      title: "Post title",
      content: "Post content",
      authorId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    });

    const useCase = new CreatePostUseCase(postRepository);

    const result = await useCase.execute({
      title: "Post title",
      content: "Post content",
      authorId: "user-1",
    });

    expect(postRepository.create).toHaveBeenCalledWith({
      title: "Post title",
      content: "Post content",
      authorId: "user-1",
    });
    expect(result).toEqual({
      id: "post-1",
      title: "Post title",
      content: "Post content",
      authorId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    });
  });

  it("should propagate repository errors", async () => {
    postRepository.create.mockRejectedValue(new Error("db failure"));

    const useCase = new CreatePostUseCase(postRepository);

    await expect(
      useCase.execute({
        title: "Post title",
        content: "Post content",
        authorId: "user-1",
      }),
    ).rejects.toThrow("db failure");
  });
});
