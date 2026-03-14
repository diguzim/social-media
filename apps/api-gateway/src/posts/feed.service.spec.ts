import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { FeedService } from './feed.service';
import { POSTS_SERVICE } from './posts.client';
import { AUTH_SERVICE } from '../auth/auth.client';

const mockPostsClient = { send: jest.fn() };
const mockAuthClient = { send: jest.fn() };

const makePost = (id: string, authorId: string) => ({
  id,
  title: `Title ${id}`,
  content: `Content ${id}`,
  authorId,
  createdAt: new Date().toISOString(),
});

const makeGetPostsReply = (posts: ReturnType<typeof makePost>[]) => ({
  data: posts,
  total: posts.length,
  page: 1,
  limit: 10,
  totalPages: 1,
});

describe('FeedService', () => {
  let service: FeedService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        { provide: POSTS_SERVICE, useValue: mockPostsClient },
        { provide: AUTH_SERVICE, useValue: mockAuthClient },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
  });

  it('enriches posts with author names', async () => {
    const post = makePost('p1', 'u1');
    mockPostsClient.send.mockReturnValue(of(makeGetPostsReply([post])));
    mockAuthClient.send.mockReturnValue(
      of({ id: 'u1', name: 'Alice', email: 'alice@example.com' }),
    );

    const result = await service.getFeed();

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.author).toEqual({ id: 'u1', name: 'Alice' });
    expect(result.data[0]?.authorId).toBe('u1');
  });

  it('deduplicates authorId lookups across multiple posts', async () => {
    const posts = [makePost('p1', 'u1'), makePost('p2', 'u1')];
    mockPostsClient.send.mockReturnValue(of(makeGetPostsReply(posts)));
    mockAuthClient.send.mockReturnValue(
      of({ id: 'u1', name: 'Alice', email: 'alice@example.com' }),
    );

    const result = await service.getFeed();

    // Auth service called only once for the same authorId
    expect(mockAuthClient.send).toHaveBeenCalledTimes(1);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]?.author?.name).toBe('Alice');
    expect(result.data[1]?.author?.name).toBe('Alice');
  });

  it('falls back to "Unknown User" when auth-service throws', async () => {
    const post = makePost('p1', 'u-missing');
    mockPostsClient.send.mockReturnValue(of(makeGetPostsReply([post])));
    mockAuthClient.send.mockReturnValue(
      throwError(() => new Error('not found')),
    );

    const result = await service.getFeed();

    expect(result.data[0]?.author).toEqual({
      id: 'u-missing',
      name: 'Unknown User',
    });
  });

  it('passes pagination and filter params to posts-service', async () => {
    mockPostsClient.send.mockReturnValue(of(makeGetPostsReply([])));

    await service.getFeed(2, 5, 'u1', 'desc');

    const callArg = mockPostsClient.send.mock.calls[0]?.[1] as Record<
      string,
      unknown
    >;
    expect(callArg?.page).toBe(2);
    expect(callArg?.limit).toBe(5);
    expect(callArg?.authorId).toBe('u1');
    expect(callArg?.sortOrder).toBe('desc');
  });

  it('returns empty data when posts-service returns no posts', async () => {
    mockPostsClient.send.mockReturnValue(of(makeGetPostsReply([])));

    const result = await service.getFeed();

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(mockAuthClient.send).not.toHaveBeenCalled();
  });
});
