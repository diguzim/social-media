/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { PostsController } from './posts.controller';
import { FeedService } from './feed.service';
import { POSTS_SERVICE } from './posts.client';
import { IMAGE_SERVICE } from '../images/image.client';
import type { API } from '@repo/contracts';
import { COMMENT_COMMANDS } from '@repo/contracts';
import { of } from 'rxjs';

const mockFeedService = {
  getFeed: jest.fn(),
} as FeedService;
const mockPostsClient = {
  send: jest.fn(),
} as any;
const mockImageClient = {
  send: jest.fn(),
} as any;

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
        { provide: IMAGE_SERVICE, useValue: mockImageClient },
        { provide: FeedService, useValue: mockFeedService },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('delegates to FeedService with parsed query params', async () => {
    const feedResponse = makeFeedResponse();
    mockFeedService.getFeed.mockResolvedValue(feedResponse);

    const result = await controller.getFeed(
      { user: { userId: 'current-user' } },
      '2',
      '5',
      'u1',
      'desc',
    );

    expect(mockFeedService.getFeed).toHaveBeenCalledWith(
      2,
      5,
      'u1',
      'desc',
      'current-user',
    );
    expect(result).toBe(feedResponse);
  });

  it('passes undefined when query params are absent', async () => {
    mockFeedService.getFeed.mockResolvedValue(makeFeedResponse());

    await controller.getFeed(
      { user: { userId: 'current-user' } },
      undefined,
      undefined,
      undefined,
      undefined,
    );

    expect(mockFeedService.getFeed).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      undefined,
      'current-user',
    );
  });

  it('returns enriched feed posts with author info', async () => {
    const feedResponse = makeFeedResponse();
    mockFeedService.getFeed.mockResolvedValue(feedResponse);

    const result = await controller.getFeed(
      { user: { userId: 'current-user' } },
      undefined,
      undefined,
      undefined,
      undefined,
    );

    expect(result.data[0]?.author).toEqual({ id: 'u1', name: 'Alice' });
    expect(result.data[0]?.authorId).toBe('u1');
  });
});

describe('PostsController – comments endpoints', () => {
  let controller: PostsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: POSTS_SERVICE, useValue: mockPostsClient },
        { provide: IMAGE_SERVICE, useValue: mockImageClient },
        { provide: FeedService, useValue: mockFeedService },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('forwards create comment to posts service and maps reply', async () => {
    const rpcReply = {
      id: 'comment-1',
      postId: 'post-1',
      authorId: 'user-1',
      content: 'Nice post',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: null,
    };

    mockPostsClient.send.mockReturnValue(of(rpcReply));

    const result = await controller.createComment(
      'post-1',
      { content: 'Nice post' },
      { user: { userId: 'user-1' } },
    );

    expect(mockPostsClient.send).toHaveBeenCalledWith(
      { cmd: COMMENT_COMMANDS.createComment },
      {
        postId: 'post-1',
        authorId: 'user-1',
        content: 'Nice post',
        correlationId: undefined,
      },
    );
    expect(result).toEqual(rpcReply);
  });

  it('forwards get comments query to posts service and maps pagination', async () => {
    const rpcReply = {
      data: [
        {
          id: 'comment-1',
          postId: 'post-2',
          authorId: 'user-2',
          content: 'First',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: null,
        },
      ],
      total: 1,
      page: 2,
      limit: 5,
      totalPages: 1,
    };

    mockPostsClient.send.mockReturnValue(of(rpcReply));

    const result = await controller.getComments('post-2', '2', '5', 'asc');

    expect(mockPostsClient.send).toHaveBeenCalledWith(
      { cmd: COMMENT_COMMANDS.getComments },
      {
        postId: 'post-2',
        page: 2,
        limit: 5,
        sortOrder: 'asc',
        correlationId: undefined,
      },
    );
    expect(result).toEqual(rpcReply);
  });

  it('forwards update comment to posts service and maps reply', async () => {
    const rpcReply = {
      id: 'comment-2',
      postId: 'post-3',
      authorId: 'user-3',
      content: 'Updated content',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T01:00:00.000Z',
    };

    mockPostsClient.send.mockReturnValue(of(rpcReply));

    const result = await controller.updateComment(
      'post-3',
      'comment-2',
      { content: 'Updated content' },
      { user: { userId: 'user-3' } },
    );

    expect(mockPostsClient.send).toHaveBeenCalledWith(
      { cmd: COMMENT_COMMANDS.updateComment },
      {
        postId: 'post-3',
        commentId: 'comment-2',
        authorId: 'user-3',
        content: 'Updated content',
        correlationId: undefined,
      },
    );
    expect(result).toEqual(rpcReply);
  });

  it('forwards delete comment to posts service and maps success response', async () => {
    mockPostsClient.send.mockReturnValue(of({ success: true }));

    const result = await controller.deleteComment('post-4', 'comment-4', {
      user: { userId: 'user-4' },
    });

    expect(mockPostsClient.send).toHaveBeenCalledWith(
      { cmd: COMMENT_COMMANDS.deleteComment },
      {
        postId: 'post-4',
        commentId: 'comment-4',
        authorId: 'user-4',
        correlationId: undefined,
      },
    );
    expect(result).toEqual({ success: true });
  });
});
