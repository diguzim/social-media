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
    {
      provide: APP_INTERCEPTOR,
      useClass: LogContextInterceptor,
    },
  ],
})
export class AppModule {}
