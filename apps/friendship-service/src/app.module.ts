import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import {
  LogContextInterceptor,
  getCorrelationId,
  getRequestDurationMs,
  getUserId,
} from "@repo/log-context";
import { FriendshipController } from "./friendship/friendship.controller";
import { DatabaseModule } from "./infra/database/database.module";
import { SendFriendRequestUseCase } from "./core/application/friendship/send-friend-request.use-case";
import { AcceptFriendRequestUseCase } from "./core/application/friendship/accept-friend-request.use-case";
import { RejectFriendRequestUseCase } from "./core/application/friendship/reject-friend-request.use-case";
import { ListFriendsUseCase } from "./core/application/friendship/list-friends.use-case";
import { ListIncomingPendingUseCase } from "./core/application/friendship/list-incoming-pending.use-case";
import { ListOutgoingPendingUseCase } from "./core/application/friendship/list-outgoing-pending.use-case";
import { GetFriendshipStatusUseCase } from "./core/application/friendship/get-friendship-status.use-case";

const serviceName = "friendship-service";
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
  ],
  controllers: [FriendshipController],
  providers: [
    SendFriendRequestUseCase,
    AcceptFriendRequestUseCase,
    RejectFriendRequestUseCase,
    ListFriendsUseCase,
    ListIncomingPendingUseCase,
    ListOutgoingPendingUseCase,
    GetFriendshipStatusUseCase,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogContextInterceptor,
    },
  ],
})
export class AppModule {}
