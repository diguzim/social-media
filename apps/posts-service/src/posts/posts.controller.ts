import { Controller, Logger } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { CreatePostUseCase } from "src/core/application/posts/create-post.use-case";
import { GetPostUseCase } from "src/core/application/posts/get-post.use-case";
import { POST_COMMANDS } from "@repo/contracts";
import type {
  CreatePostRequest,
  CreatePostReply,
  GetPostRequest,
  GetPostReply,
} from "@repo/contracts";

@Controller()
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(
    private createPostUseCase: CreatePostUseCase,
    private getPostUseCase: GetPostUseCase,
  ) {}

  @MessagePattern({ cmd: POST_COMMANDS.createPost })
  async handleCreatePost(request: CreatePostRequest): Promise<CreatePostReply> {
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
  async handleGetPost(request: GetPostRequest): Promise<GetPostReply> {
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
}
