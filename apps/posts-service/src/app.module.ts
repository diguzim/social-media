import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { PostsController } from "./posts/posts.controller";
import { DatabaseModule } from "./infra/database/database.module";
import { CreatePostUseCase } from "./core/application/posts/create-post.use-case";
import { GetPostUseCase } from "./core/application/posts/get-post.use-case";
import { GetPostsUseCase } from "./core/application/posts/get-posts.use-case";
import { UpdatePostUseCase } from "./core/application/posts/update-post.use-case";
import { DeletePostUseCase } from "./core/application/posts/delete-post.use-case";
import { CreateCommentUseCase } from "./core/application/comments/create-comment.use-case";
import { GetCommentsUseCase } from "./core/application/comments/get-comments.use-case";
import { UpdateCommentUseCase } from "./core/application/comments/update-comment.use-case";
import { DeleteCommentUseCase } from "./core/application/comments/delete-comment.use-case";
import { ToggleReactionUseCase } from "./core/application/reactions/toggle-reaction.use-case";
import { GetReactionSummaryBatchUseCase } from "./core/application/reactions/get-reaction-summary-batch.use-case";
import {
  LogContextInterceptor,
  getCorrelationId,
  getRequestDurationMs,
  getUserId,
} from "@repo/log-context";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({
          correlationId: getCorrelationId(),
          userId: getUserId(),
          requestDurationMs: getRequestDurationMs(),
          service: "posts-service",
          environment: process.env.NODE_ENV ?? "development",
        }),
      },
    }),
    DatabaseModule,
  ],
  controllers: [PostsController],
  providers: [
    CreatePostUseCase,
    GetPostUseCase,
    GetPostsUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    CreateCommentUseCase,
    GetCommentsUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
    ToggleReactionUseCase,
    GetReactionSummaryBatchUseCase,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogContextInterceptor,
    },
  ],
})
export class AppModule {}
