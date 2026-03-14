import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_COMMANDS, POST_COMMANDS } from '@repo/contracts';
import type { API, RPC } from '@repo/contracts';
import { getCorrelationId } from '@repo/log-context';
import { POSTS_SERVICE } from './posts.client';
import { AUTH_SERVICE } from '../auth/auth.client';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    @Inject(POSTS_SERVICE) private readonly postsClient: ClientProxy,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  async getFeed(
    page?: number,
    limit?: number,
    authorId?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<API.GetFeedResponse> {
    this.logger.debug('FeedService: fetching posts from posts-service');

    // 1. Fetch posts from posts-service
    const rpcRequest: RPC.GetPostsRequest = {
      page,
      limit,
      authorId,
      sortOrder,
      correlationId: getCorrelationId(),
    };

    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.GetPostsReply, RPC.GetPostsRequest>(
        { cmd: POST_COMMANDS.getPosts },
        rpcRequest,
      ),
    );

    // 2. Collect unique authorIds
    const uniqueAuthorIds = [...new Set(rpcReply.data.map((p) => p.authorId))];

    this.logger.debug(
      `FeedService: enriching ${uniqueAuthorIds.length} unique authors`,
    );

    // 3. Batch-fetch author profiles from auth-service (with graceful fallback)
    const authorMap = new Map<string, API.FeedPostAuthor>();

    await Promise.all(
      uniqueAuthorIds.map(async (userId) => {
        try {
          const profileRequest: RPC.GetProfileRequest = {
            userId,
            correlationId: getCorrelationId(),
          };
          const profile = await firstValueFrom(
            this.authClient.send<RPC.GetProfileReply, RPC.GetProfileRequest>(
              { cmd: AUTH_COMMANDS.getProfile },
              profileRequest,
            ),
          );
          authorMap.set(userId, { id: profile.id, name: profile.name });
        } catch (err) {
          this.logger.warn(
            `FeedService: could not fetch profile for userId=${userId}, using fallback`,
          );
          authorMap.set(userId, { id: userId, name: 'Unknown User' });
        }
      }),
    );

    // 4. Enrich posts with author info and return API response
    return {
      data: rpcReply.data.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        author: authorMap.get(post.authorId) ?? {
          id: post.authorId,
          name: 'Unknown User',
        },
        createdAt: post.createdAt,
      })),
      total: rpcReply.total,
      page: rpcReply.page,
      limit: rpcReply.limit,
      totalPages: rpcReply.totalPages,
    };
  }
}
