import { GetCommentsUseCase } from "./get-comments.use-case";
import { CommentRepository } from "src/core/domain/comment/comment.repository";

describe("GetCommentsUseCase", () => {
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

  it("should return paginated comments", async () => {
    const createdAt = new Date("2026-01-01T00:00:00Z");
    commentRepository.findMany.mockResolvedValue({
      data: [
        {
          id: "c1",
          postId: "p1",
          authorId: "u1",
          content: "Comment",
          createdAt,
          updatedAt: undefined,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    const useCase = new GetCommentsUseCase(commentRepository);

    const result = await useCase.execute({ postId: "p1", page: 1, limit: 20 });

    expect(commentRepository.findMany).toHaveBeenCalledWith({
      postId: "p1",
      page: 1,
      limit: 20,
      sortOrder: undefined,
    });
    expect(result.total).toBe(1);
    expect(result.data[0]?.createdAt).toEqual(createdAt);
  });
});
