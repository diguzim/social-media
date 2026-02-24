import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { POSTS_SERVICE } from './posts.client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { POST_COMMANDS } from '@repo/contracts';
import { getCorrelationId } from '@repo/log-context';
import type {
  CreatePostRequest,
  CreatePostReply,
  GetPostRequest,
  GetPostReply,
} from '@repo/contracts';

@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(
    @Inject(POSTS_SERVICE) private readonly postsClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createPost(
    @Body() payload: Omit<CreatePostRequest, 'correlationId' | 'authorId'>,
    @Request() req: { user: { userId: string } },
  ) {
    this.logger.debug('API Gateway: forwarding create post to posts service');
    return this.postsClient.send<CreatePostReply>(
      { cmd: POST_COMMANDS.createPost },
      {
        ...payload,
        authorId: req.user.userId,
        correlationId: getCorrelationId(),
      } as CreatePostRequest,
    );
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    this.logger.debug('API Gateway: forwarding get post to posts service');
    return this.postsClient.send<GetPostReply>({ cmd: POST_COMMANDS.getPost }, {
      postId: id,
      correlationId: getCorrelationId(),
    } as GetPostRequest);
  }
}
