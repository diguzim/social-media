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
import { HealthController } from "./health.controller";

const serviceName = "event-handler-service";
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
  controllers: [HealthController],
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
