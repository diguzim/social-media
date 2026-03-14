import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { PostsController } from './posts.controller';
import { FeedService } from './feed.service';
import { POSTS_SERVICE } from './posts.client';
import type { API } from '@repo/contracts';

const mockFeedService = { getFeed: jest.fn() };
const mockPostsClient = { send: jest.fn() };

const makeFeedResponse = (): API.GetFeedResponse => ({
  data: [
    {
      id: 'p1',
      title: 'Hello World',
      content: 'Some content',
      authorId: 'u1',
      author: { id: 'u1', name: 'Alice' },
      createdAt: new Date().toISOString(),
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
});

describe('PostsController – GET /posts/feed', () => {
  let controller: PostsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: POSTS_SERVICE, useValue: mockPostsClient },
        { provide: FeedService, useValue: mockFeedService },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('delegates to FeedService with parsed query params', async () => {
    const feedResponse = makeFeedResponse();
    mockFeedService.getFeed.mockResolvedValue(feedResponse);

    const result = await controller.getFeed('2', '5', 'u1', 'desc');

    expect(mockFeedService.getFeed).toHaveBeenCalledWith(2, 5, 'u1', 'desc');
    expect(result).toBe(feedResponse);
  });

  it('passes undefined when query params are absent', async () => {
    mockFeedService.getFeed.mockResolvedValue(makeFeedResponse());

    await controller.getFeed(undefined, undefined, undefined, undefined);

    expect(mockFeedService.getFeed).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      undefined,
    );
  });

  it('returns enriched feed posts with author info', async () => {
    const feedResponse = makeFeedResponse();
    mockFeedService.getFeed.mockResolvedValue(feedResponse);

    const result = await controller.getFeed();

    expect(result.data[0]?.author).toEqual({ id: 'u1', name: 'Alice' });
    expect(result.data[0]?.authorId).toBe('u1');
  });
});
