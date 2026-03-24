import { Controller, Logger } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { CreatePostUseCase } from "src/core/application/posts/create-post.use-case";
import { GetPostUseCase } from "src/core/application/posts/get-post.use-case";
import { GetPostsUseCase } from "src/core/application/posts/get-posts.use-case";
import { UpdatePostUseCase } from "src/core/application/posts/update-post.use-case";
import { DeletePostUseCase } from "src/core/application/posts/delete-post.use-case";
import { ToggleReactionUseCase } from "src/core/application/reactions/toggle-reaction.use-case";
import { GetReactionSummaryBatchUseCase } from "src/core/application/reactions/get-reaction-summary-batch.use-case";
import { POST_COMMANDS, REACTION_COMMANDS } from "@repo/contracts";
import type { RPC } from "@repo/contracts";

@Controller()
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(
    private createPostUseCase: CreatePostUseCase,
    private getPostUseCase: GetPostUseCase,
    private getPostsUseCase: GetPostsUseCase,
    private updatePostUseCase: UpdatePostUseCase,
    private deletePostUseCase: DeletePostUseCase,
    private toggleReactionUseCase: ToggleReactionUseCase,
    private getReactionSummaryBatchUseCase: GetReactionSummaryBatchUseCase,
  ) {}

  @MessagePattern({ cmd: POST_COMMANDS.createPost })
  async handleCreatePost(
    request: RPC.CreatePostRequest,
  ): Promise<RPC.CreatePostReply> {
    this.logger.debug("Posts service: handling create post command", request);

    const post = await this.createPostUseCase.execute({
      title: request.title,
      content: request.content,
      authorId: request.authorId,
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
    };
  }

  @MessagePattern({ cmd: POST_COMMANDS.getPost })
  async handleGetPost(request: RPC.GetPostRequest): Promise<RPC.GetPostReply> {
    this.logger.debug("Posts service: handling get post command", request);

    const post = await this.getPostUseCase.execute({
      postId: request.postId,
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
    };
  }

  @MessagePattern({ cmd: POST_COMMANDS.getPosts })
  async handleGetPosts(
    request: RPC.GetPostsRequest,
  ): Promise<RPC.GetPostsReply> {
    this.logger.debug("Posts service: handling get posts command", request);

    const result = await this.getPostsUseCase.execute({
      page: request.page,
      limit: request.limit,
      authorId: request.authorId,
      sortOrder: request.sortOrder,
    });

    return {
      data: result.data.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        createdAt: post.createdAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @MessagePattern({ cmd: POST_COMMANDS.updatePost })
  async handleUpdatePost(
    request: RPC.UpdatePostRequest,
  ): Promise<RPC.UpdatePostReply> {
    this.logger.debug("Posts service: handling update post command", request);

    const post = await this.updatePostUseCase.execute({
      postId: request.postId,
      authorId: request.authorId,
      title: request.title,
      content: request.content,
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
    };
  }

  @MessagePattern({ cmd: POST_COMMANDS.deletePost })
  async handleDeletePost(
    request: RPC.DeletePostRequest,
  ): Promise<RPC.DeletePostReply> {
    this.logger.debug("Posts service: handling delete post command", request);

    await this.deletePostUseCase.execute({
      postId: request.postId,
      authorId: request.authorId,
    });

    return {
      success: true,
    };
  }

  @MessagePattern({ cmd: REACTION_COMMANDS.toggleReaction })
  async handleToggleReaction(
    request: RPC.ToggleReactionRequest,
  ): Promise<RPC.ToggleReactionReply> {
    this.logger.debug(
      "Posts service: handling toggle reaction command",
      request,
    );

    const result = await this.toggleReactionUseCase.execute({
      userId: request.userId,
      targetId: request.targetId,
      targetType: request.targetType,
      reactionType: request.reactionType,
    });

    return {
      reactionId: result.reactionId,
      targetId: result.targetId,
      reactionType: result.reactionType,
      targetType: result.targetType,
      isAdded: result.isAdded,
    };
  }

  @MessagePattern({ cmd: REACTION_COMMANDS.getReactionSummaryBatch })
  async handleGetReactionSummaryBatch(
    request: RPC.GetReactionSummaryBatchRequest,
  ): Promise<RPC.GetReactionSummaryBatchReply> {
    this.logger.debug(
      "Posts service: handling get reaction summary batch command",
      request,
    );

    const result = await this.getReactionSummaryBatchUseCase.execute({
      targetIds: request.targetIds,
      targetType: request.targetType,
      userId: request.userId,
    });

    return {
      summaries: result.summaries.map((s) => ({
        targetId: s.targetId,
        reactionType: s.reactionType,
        count: s.count,
        reactedByCurrentUser: s.reactedByCurrentUser,
      })),
    };
  }
}
