import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { POSTS_SERVICE } from './posts.client';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { POST_COMMANDS } from '@repo/contracts';
import { getCorrelationId } from '@repo/log-context';
import type { API, RPC } from '@repo/contracts';
import { firstValueFrom } from 'rxjs';

@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(
    @Inject(POSTS_SERVICE) private readonly postsClient: ClientProxy,
    private readonly feedService: FeedService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Body() payload: API.CreatePostRequest,
    @Request() req: { user: { userId: string } },
  ): Promise<API.CreatePostResponse> {
    this.logger.debug('API Gateway: forwarding create post to posts service');

    // Transform API request to RPC request
    const rpcRequest: RPC.CreatePostRequest = {
      ...payload,
      authorId: req.user.userId,
      correlationId: getCorrelationId(),
    };

    // Call microservice
    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.CreatePostReply, RPC.CreatePostRequest>(
        { cmd: POST_COMMANDS.createPost },
        rpcRequest,
      ),
    );

    // Transform RPC reply to API response
    return {
      id: rpcReply.id,
      title: rpcReply.title,
      content: rpcReply.content,
      authorId: rpcReply.authorId,
      createdAt: rpcReply.createdAt,
    };
  }

  @Get('feed')
  async getFeed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('authorId') authorId?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<API.GetFeedResponse> {
    this.logger.debug('API Gateway: handling GET /posts/feed');
    return this.feedService.getFeed(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      authorId,
      sortOrder,
    );
  }

  @Get()
  async getPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('authorId') authorId?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<API.GetPostsResponse> {
    this.logger.debug('API Gateway: forwarding list posts to posts service');

    // Create RPC request
    const rpcRequest: RPC.GetPostsRequest = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      authorId,
      sortOrder,
      correlationId: getCorrelationId(),
    };

    // Call microservice
    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.GetPostsReply, RPC.GetPostsRequest>(
        { cmd: POST_COMMANDS.getPosts },
        rpcRequest,
      ),
    );

    // Transform RPC reply to API response (same structure in this case)
    return {
      data: rpcReply.data.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        createdAt: post.createdAt,
      })),
      total: rpcReply.total,
      page: rpcReply.page,
      limit: rpcReply.limit,
      totalPages: rpcReply.totalPages,
    };
  }

  @Get(':id')
  async getPost(@Param('id') id: string): Promise<API.GetPostResponse> {
    this.logger.debug('API Gateway: forwarding get post to posts service');

    // Create RPC request
    const rpcRequest: RPC.GetPostRequest = {
      postId: id,
      correlationId: getCorrelationId(),
    };

    // Call microservice
    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.GetPostReply, RPC.GetPostRequest>(
        { cmd: POST_COMMANDS.getPost },
        rpcRequest,
      ),
    );

    // Transform RPC reply to API response
    return {
      id: rpcReply.id,
      title: rpcReply.title,
      content: rpcReply.content,
      authorId: rpcReply.authorId,
      createdAt: rpcReply.createdAt,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('id') id: string,
    @Body() payload: API.UpdatePostRequest,
    @Request() req: { user: { userId: string } },
  ): Promise<API.UpdatePostResponse> {
    this.logger.debug('API Gateway: forwarding update post to posts service');

    // Transform API request to RPC request
    const rpcRequest: RPC.UpdatePostRequest = {
      postId: id,
      authorId: req.user.userId,
      ...payload,
      correlationId: getCorrelationId(),
    };

    // Call microservice
    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.UpdatePostReply, RPC.UpdatePostRequest>(
        { cmd: POST_COMMANDS.updatePost },
        rpcRequest,
      ),
    );

    // Transform RPC reply to API response
    return {
      id: rpcReply.id,
      title: rpcReply.title,
      content: rpcReply.content,
      authorId: rpcReply.authorId,
      createdAt: rpcReply.createdAt,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ): Promise<API.DeletePostResponse> {
    this.logger.debug('API Gateway: forwarding delete post to posts service');

    // Create RPC request
    const rpcRequest: RPC.DeletePostRequest = {
      postId: id,
      authorId: req.user.userId,
      correlationId: getCorrelationId(),
    };

    // Call microservice
    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.DeletePostReply, RPC.DeletePostRequest>(
        { cmd: POST_COMMANDS.deletePost },
        rpcRequest,
      ),
    );

    // Transform RPC reply to API response
    return {
      success: rpcReply.success,
    };
  }
}
