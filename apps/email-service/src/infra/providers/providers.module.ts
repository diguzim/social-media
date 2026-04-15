import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EMAIL_PROVIDER } from "./email-provider";
import { LoggingEmailProvider } from "./logging-email.provider";
import { SendGridEmailProvider } from "./sendgrid-email.provider";

@Module({
  providers: [
    LoggingEmailProvider,
    SendGridEmailProvider,
    {
      provide: EMAIL_PROVIDER,
      inject: [ConfigService, LoggingEmailProvider, SendGridEmailProvider],
      useFactory: (
        configService: ConfigService,
        loggingProvider: LoggingEmailProvider,
        sendGridProvider: SendGridEmailProvider,
      ) => {
        const providerName = (
          configService.get<string>("EMAIL_PROVIDER") ?? "logging"
        ).toLowerCase();

        if (providerName === "sendgrid") {
          return sendGridProvider;
        }

        return loggingProvider;
      },
    },
  ],
  exports: [EMAIL_PROVIDER],
})
export class ProvidersModule {}
