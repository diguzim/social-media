import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { APP_INTERCEPTOR } from "@nestjs/core";
import {
  LogContextInterceptor,
  getCorrelationId,
  getRequestDurationMs,
  getUserId,
} from "@repo/log-context";
import { ImageController } from "./image/image.controller";
import { UploadProfileImageUseCase } from "./core/application/image/upload-profile-image.use-case";
import { GetProfileImageUseCase } from "./core/application/image/get-profile-image.use-case";
import { UploadPostImageUseCase } from "./core/application/image/upload-post-image.use-case";
import { GetPostImageUseCase } from "./core/application/image/get-post-image.use-case";
import { DeletePostImageUseCase } from "./core/application/image/delete-post-image.use-case";
import { ReorderPostImagesUseCase } from "./core/application/image/reorder-post-images.use-case";
import { DatabaseModule } from "./infra/database/database.module";
import { StorageModule } from "./infra/storage/storage.module";

const serviceName = "image-service";
const environment = process.env.NODE_ENV ?? "development";
const logsToLokiEnabled = (process.env.LOGS_TO_LOKI ?? "true") === "true";
const lokiHost = `${process.env.LOKI_HOST ?? "http://localhost"}:${process.env.LOKI_PORT ?? "3100"}`;
const lokiTransport = logsToLokiEnabled
  ? {
      target: "pino-loki",
      options: {
        host: lokiHost,
        batching: {
          interval: 5,
        },
        labels: {
          service: serviceName,
          environment,
        },
      },
    }
  : undefined;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: lokiTransport,
        customProps: () => ({
          correlationId: getCorrelationId(),
          userId: getUserId(),
          requestDurationMs: getRequestDurationMs(),
          service: serviceName,
          environment,
        }),
      },
    }),
    DatabaseModule,
    StorageModule,
  ],
  controllers: [ImageController],
  providers: [
    UploadProfileImageUseCase,
    GetProfileImageUseCase,
    UploadPostImageUseCase,
    GetPostImageUseCase,
    DeletePostImageUseCase,
    ReorderPostImagesUseCase,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogContextInterceptor,
    },
  ],
})
export class AppModule {}
