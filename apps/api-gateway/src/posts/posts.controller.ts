import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  Patch,
  Query,
  Request,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { POSTS_SERVICE } from './posts.client';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  COMMENT_COMMANDS,
  IMAGE_COMMANDS,
  POST_COMMANDS,
  REACTION_COMMANDS,
} from '@repo/contracts';
import { getCorrelationId } from '@repo/log-context';
import type { API, RPC } from '@repo/contracts';
import { firstValueFrom } from 'rxjs';
import { IMAGE_SERVICE } from 'src/images/image.client';
import type { Express, Response } from 'express';

@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);
  private static readonly MAX_POST_IMAGES = 10;
  private static readonly MAX_POST_IMAGE_BYTES = 10 * 1024 * 1024;
  private static readonly ALLOWED_POST_IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
  ]);

  constructor(
    @Inject(POSTS_SERVICE) private readonly postsClient: ClientProxy,
    @Inject(IMAGE_SERVICE) private readonly imageClient: ClientProxy,
    private readonly feedService: FeedService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', PostsController.MAX_POST_IMAGES))
  async createPost(
    @Body() payload: API.CreatePostRequest,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Request() req: { user: { userId: string } },
  ): Promise<API.CreatePostResponse> {
    this.logger.debug('API Gateway: forwarding create post to posts service');

    this.validatePostImages(files);

    const rpcRequest: RPC.CreatePostRequest = {
      ...payload,
      authorId: req.user.userId,
      correlationId: getCorrelationId(),
    };

    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.CreatePostReply, RPC.CreatePostRequest>(
        { cmd: POST_COMMANDS.createPost },
        rpcRequest,
      ),
    );

    const uploadedImages = await this.uploadPostImages(
      rpcReply.id,
      req.user.userId,
      files,
    );

    if (uploadedImages.length > 0) {
      await firstValueFrom(
        this.postsClient.send<RPC.UpdatePostReply, RPC.UpdatePostRequest>(
          { cmd: POST_COMMANDS.updatePost },
          {
            postId: rpcReply.id,
            authorId: req.user.userId,
            images: uploadedImages.map((img, index) => ({
              id: img.id,
              mimeType: img.mimeType,
              orderIndex: index,
              uploadedAt: img.uploadedAt,
            })),
            correlationId: getCorrelationId(),
          },
        ),
      );
    }

    return {
      id: rpcReply.id,
      title: rpcReply.title,
      content: rpcReply.content,
      authorId: rpcReply.authorId,
      createdAt: rpcReply.createdAt,
      images: uploadedImages.length
        ? uploadedImages.map((img, index) => ({
            id: img.id,
            imageUrl: this.buildPostImageUrl(rpcReply.id, img.id),
            mimeType: img.mimeType,
            orderIndex: index,
            uploadedAt: img.uploadedAt,
          }))
        : [],
    };
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async getFeed(
    @Request() req: { user: { userId: string } },
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
      req.user.userId,
    );
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
      images: this.mapRpcPostImages(rpcReply.id, rpcReply.images),
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
      images: this.mapRpcPostImages(rpcReply.id, rpcReply.images),
    };
  }

  @Get(':postId/images/:imageId')
  async getPostImage(
    @Param('postId') postId: string,
    @Param('imageId') imageId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const rpcRequest: RPC.GetPostImageRequest = {
      postId,
      imageId,
      correlationId: getCorrelationId(),
    };

    let rpcReply: RPC.GetPostImageReply;

    try {
      rpcReply = await firstValueFrom(
        this.imageClient.send<RPC.GetPostImageReply, RPC.GetPostImageRequest>(
          { cmd: IMAGE_COMMANDS.getPostImage },
          rpcRequest,
        ),
      );
    } catch {
      throw new NotFoundException('Post image not found');
    }

    const fileBuffer = Buffer.from(rpcReply.fileBase64, 'base64');
    if (fileBuffer.length === 0) {
      throw new NotFoundException('Post image not found');
    }

    res.setHeader('Content-Type', rpcReply.mimeType);
    res.setHeader('Content-Length', String(rpcReply.contentLength));
    res.setHeader('Cache-Control', 'public, max-age=60');

    return new StreamableFile(fileBuffer);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', PostsController.MAX_POST_IMAGES))
  async addPostImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Request() req: { user: { userId: string } },
  ): Promise<API.UpdatePostResponse> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const post = await this.getRpcPost(id);

    if (post.authorId !== req.user.userId) {
      throw new BadRequestException('Only the post author can manage images');
    }

    const existingImages = post.images ?? [];
    this.validatePostImages(files, existingImages.length);

    const uploaded = await this.uploadPostImages(id, req.user.userId, files);
    const combined = [
      ...existingImages,
      ...uploaded.map((img, index) => ({
        id: img.id,
        mimeType: img.mimeType,
        orderIndex: existingImages.length + index,
        uploadedAt: img.uploadedAt,
      })),
    ];

    const updated = await firstValueFrom(
      this.postsClient.send<RPC.UpdatePostReply, RPC.UpdatePostRequest>(
        { cmd: POST_COMMANDS.updatePost },
        {
          postId: id,
          authorId: req.user.userId,
          images: combined,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      authorId: updated.authorId,
      createdAt: updated.createdAt,
      images: this.mapRpcPostImages(updated.id, updated.images),
    };
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  async removePostImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Request() req: { user: { userId: string } },
  ): Promise<API.UpdatePostResponse> {
    const post = await this.getRpcPost(id);

    if (post.authorId !== req.user.userId) {
      throw new BadRequestException('Only the post author can manage images');
    }

    await firstValueFrom(
      this.imageClient.send<
        RPC.DeletePostImageReply,
        RPC.DeletePostImageRequest
      >(
        { cmd: IMAGE_COMMANDS.deletePostImage },
        {
          postId: id,
          imageId,
          userId: req.user.userId,
          correlationId: getCorrelationId(),
        },
      ),
    );

    const remainingImages = (post.images ?? [])
      .filter((img) => img.id !== imageId)
      .map((img, index) => ({
        ...img,
        orderIndex: index,
      }));

    const updated = await firstValueFrom(
      this.postsClient.send<RPC.UpdatePostReply, RPC.UpdatePostRequest>(
        { cmd: POST_COMMANDS.updatePost },
        {
          postId: id,
          authorId: req.user.userId,
          images: remainingImages,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      authorId: updated.authorId,
      createdAt: updated.createdAt,
      images: this.mapRpcPostImages(updated.id, updated.images),
    };
  }

  @Patch(':id/images/reorder')
  @UseGuards(JwtAuthGuard)
  async reorderPostImages(
    @Param('id') id: string,
    @Body() payload: { imageOrder: string[] },
    @Request() req: { user: { userId: string } },
  ): Promise<API.UpdatePostResponse> {
    const post = await this.getRpcPost(id);

    if (post.authorId !== req.user.userId) {
      throw new BadRequestException('Only the post author can manage images');
    }

    const currentImageIds = new Set((post.images ?? []).map((img) => img.id));
    if (
      !payload.imageOrder ||
      payload.imageOrder.length !== currentImageIds.size ||
      payload.imageOrder.some((idItem) => !currentImageIds.has(idItem))
    ) {
      throw new BadRequestException('Invalid image order payload');
    }

    await firstValueFrom(
      this.imageClient.send<
        RPC.ReorderPostImagesReply,
        RPC.ReorderPostImagesRequest
      >(
        { cmd: IMAGE_COMMANDS.reorderPostImages },
        {
          postId: id,
          userId: req.user.userId,
          imageOrder: payload.imageOrder,
          correlationId: getCorrelationId(),
        },
      ),
    );

    const imageMap = new Map((post.images ?? []).map((img) => [img.id, img]));
    const reordered = payload.imageOrder.map((imageId, index) => {
      const current = imageMap.get(imageId);
      if (!current) {
        throw new BadRequestException('Invalid image order payload');
      }
      return {
        ...current,
        orderIndex: index,
      };
    });

    const updated = await firstValueFrom(
      this.postsClient.send<RPC.UpdatePostReply, RPC.UpdatePostRequest>(
        { cmd: POST_COMMANDS.updatePost },
        {
          postId: id,
          authorId: req.user.userId,
          images: reordered,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      authorId: updated.authorId,
      createdAt: updated.createdAt,
      images: this.mapRpcPostImages(updated.id, updated.images),
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

  @Post(':id/reactions')
  @UseGuards(JwtAuthGuard)
  async toggleReaction(
    @Param('id') id: string,
    @Body() payload: API.ToggleReactionRequest,
    @Request() req: { user: { userId: string } },
  ): Promise<API.ToggleReactionResponse> {
    this.logger.debug(
      'API Gateway: forwarding toggle reaction to posts service',
    );

    // Transform API request to RPC request
    const rpcRequest: RPC.ToggleReactionRequest = {
      userId: req.user.userId,
      targetId: id,
      targetType: 'post',
      reactionType: payload.reactionType,
      correlationId: getCorrelationId(),
    };

    // Call microservice
    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.ToggleReactionReply, RPC.ToggleReactionRequest>(
        { cmd: REACTION_COMMANDS.toggleReaction },
        rpcRequest,
      ),
    );

    // Transform RPC reply to API response
    return {
      reactionId: rpcReply.reactionId,
      targetId: rpcReply.targetId,
      reactionType: rpcReply.reactionType,
      targetType: rpcReply.targetType,
      isAdded: rpcReply.isAdded,
    };
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('id') id: string,
    @Body() payload: API.CreateCommentRequest,
    @Request() req: { user: { userId: string } },
  ): Promise<API.CreateCommentResponse> {
    this.logger.debug(
      'API Gateway: forwarding create comment to posts service',
    );

    const rpcRequest: RPC.CreateCommentRequest = {
      postId: id,
      authorId: req.user.userId,
      content: payload.content,
      correlationId: getCorrelationId(),
    };

    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.CreateCommentReply, RPC.CreateCommentRequest>(
        { cmd: COMMENT_COMMANDS.createComment },
        rpcRequest,
      ),
    );

    return {
      id: rpcReply.id,
      postId: rpcReply.postId,
      authorId: rpcReply.authorId,
      content: rpcReply.content,
      createdAt: rpcReply.createdAt,
      updatedAt: rpcReply.updatedAt,
    };
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<API.GetCommentsResponse> {
    this.logger.debug('API Gateway: forwarding get comments to posts service');

    const rpcRequest: RPC.GetCommentsRequest = {
      postId: id,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortOrder,
      correlationId: getCorrelationId(),
    };

    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.GetCommentsReply, RPC.GetCommentsRequest>(
        { cmd: COMMENT_COMMANDS.getComments },
        rpcRequest,
      ),
    );

    return {
      data: rpcReply.data.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
      total: rpcReply.total,
      page: rpcReply.page,
      limit: rpcReply.limit,
      totalPages: rpcReply.totalPages,
    };
  }

  @Patch(':postId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() payload: API.UpdateCommentRequest,
    @Request() req: { user: { userId: string } },
  ): Promise<API.UpdateCommentResponse> {
    this.logger.debug(
      'API Gateway: forwarding update comment to posts service',
    );

    const rpcRequest: RPC.UpdateCommentRequest = {
      postId,
      commentId,
      authorId: req.user.userId,
      content: payload.content,
      correlationId: getCorrelationId(),
    };

    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.UpdateCommentReply, RPC.UpdateCommentRequest>(
        { cmd: COMMENT_COMMANDS.updateComment },
        rpcRequest,
      ),
    );

    return {
      id: rpcReply.id,
      postId: rpcReply.postId,
      authorId: rpcReply.authorId,
      content: rpcReply.content,
      createdAt: rpcReply.createdAt,
      updatedAt: rpcReply.updatedAt,
    };
  }

  @Delete(':postId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Request() req: { user: { userId: string } },
  ): Promise<API.DeleteCommentResponse> {
    this.logger.debug(
      'API Gateway: forwarding delete comment to posts service',
    );

    const rpcRequest: RPC.DeleteCommentRequest = {
      postId,
      commentId,
      authorId: req.user.userId,
      correlationId: getCorrelationId(),
    };

    const rpcReply = await firstValueFrom(
      this.postsClient.send<RPC.DeleteCommentReply, RPC.DeleteCommentRequest>(
        { cmd: COMMENT_COMMANDS.deleteComment },
        rpcRequest,
      ),
    );

    return {
      success: rpcReply.success,
    };
  }

  private validatePostImages(
    files: Express.Multer.File[] | undefined,
    existingCount = 0,
  ): void {
    if (!files || files.length === 0) {
      return;
    }

    if (existingCount + files.length > PostsController.MAX_POST_IMAGES) {
      throw new BadRequestException(
        `A post can have at most ${PostsController.MAX_POST_IMAGES} images`,
      );
    }

    for (const file of files) {
      if (!PostsController.ALLOWED_POST_IMAGE_MIME_TYPES.has(file.mimetype)) {
        throw new BadRequestException(
          'Only JPG, PNG and GIF images are allowed',
        );
      }

      if (file.size > PostsController.MAX_POST_IMAGE_BYTES) {
        throw new BadRequestException('Each image must be 10MB or smaller');
      }
    }
  }

  private mapRpcPostImages(
    postId: string,
    images:
      | Array<{
          id: string;
          mimeType: string;
          orderIndex: number;
          uploadedAt: string;
        }>
      | undefined,
  ): API.PostImage[] {
    if (!images || images.length === 0) {
      return [];
    }

    return [...images]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((img) => ({
        id: img.id,
        imageUrl: this.buildPostImageUrl(postId, img.id),
        mimeType: img.mimeType,
        orderIndex: img.orderIndex,
        uploadedAt: img.uploadedAt,
      }));
  }

  private buildPostImageUrl(postId: string, imageId: string): string {
    const baseUrl =
      process.env.API_PUBLIC_BASE_URL ??
      `http://localhost:${process.env.PORT ?? '4000'}`;

    return `${baseUrl}/posts/${postId}/images/${imageId}`;
  }

  private async uploadPostImages(
    postId: string,
    userId: string,
    files: Express.Multer.File[] | undefined,
  ): Promise<Array<{ id: string; mimeType: string; uploadedAt: string }>> {
    if (!files || files.length === 0) {
      return [];
    }

    const uploaded: Array<{
      id: string;
      mimeType: string;
      uploadedAt: string;
    }> = [];

    for (const file of files) {
      const rpcReply = await firstValueFrom(
        this.imageClient.send<
          RPC.UploadPostImageReply,
          RPC.UploadPostImageRequest
        >(
          { cmd: IMAGE_COMMANDS.uploadPostImage },
          {
            postId,
            userId,
            fileBase64: file.buffer.toString('base64'),
            mimeType: file.mimetype,
            originalName: file.originalname,
            fileSize: file.size,
            correlationId: getCorrelationId(),
          },
        ),
      );

      uploaded.push({
        id: rpcReply.imageId,
        mimeType: rpcReply.mimeType,
        uploadedAt: rpcReply.uploadedAt,
      });
    }

    return uploaded;
  }

  private async getRpcPost(postId: string): Promise<RPC.GetPostReply> {
    const rpcRequest: RPC.GetPostRequest = {
      postId,
      correlationId: getCorrelationId(),
    };

    return firstValueFrom(
      this.postsClient.send<RPC.GetPostReply, RPC.GetPostRequest>(
        { cmd: POST_COMMANDS.getPost },
        rpcRequest,
      ),
    );
  }
}
