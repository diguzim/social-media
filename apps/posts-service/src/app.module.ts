import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { PostsController } from "./posts/posts.controller";
import { DatabaseModule } from "./infra/database/database.module";
import { CreatePostUseCase } from "./core/application/posts/create-post.use-case";
import { GetPostUseCase } from "./core/application/posts/get-post.use-case";
import { getCorrelationId } from "./common/correlation-id/correlation-id.storage";
import { CorrelationIdInterceptor } from "./common/correlation-id/correlation-id.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({
          correlationId: getCorrelationId(),
        }),
      },
    }),
    DatabaseModule,
  ],
  controllers: [PostsController],
  providers: [
    CreatePostUseCase,
    GetPostUseCase,
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor,
    },
  ],
})
export class AppModule {}
