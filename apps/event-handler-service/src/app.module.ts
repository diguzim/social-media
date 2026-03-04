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
import { EventHandlersModule } from "./events/event-handlers.module";

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
          service: "event-handler-service",
          environment: process.env.NODE_ENV ?? "development",
        }),
      },
    }),
    EventHandlersModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LogContextInterceptor,
    },
  ],
})
export class AppModule {}
