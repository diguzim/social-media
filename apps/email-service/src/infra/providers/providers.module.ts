import { InternalServerErrorException, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EMAIL_PROVIDER, type EmailProvider } from "./email-provider";
import { LoggingEmailProvider } from "./logging-email.provider";
import { ResendEmailProvider } from "./resend-email.provider";
import { SendGridEmailProvider } from "./sendgrid-email.provider";

@Module({
  providers: [
    LoggingEmailProvider,
    SendGridEmailProvider,
    ResendEmailProvider,
    {
      provide: EMAIL_PROVIDER,
      inject: [
        ConfigService,
        LoggingEmailProvider,
        SendGridEmailProvider,
        ResendEmailProvider,
      ],
      useFactory: (
        configService: ConfigService,
        loggingProvider: LoggingEmailProvider,
        sendGridProvider: SendGridEmailProvider,
        resendProvider: ResendEmailProvider,
      ) => {
        const providerName = (
          configService.get<string>("EMAIL_PROVIDER") ?? "logging"
        ).toLowerCase();

        const providersByName: Record<string, EmailProvider> = {
          logging: loggingProvider,
          sendgrid: sendGridProvider,
          resend: resendProvider,
        };

        const selectedProvider = providersByName[providerName];

        if (selectedProvider) {
          return selectedProvider;
        }

        throw new InternalServerErrorException(
          `Unsupported EMAIL_PROVIDER value: ${providerName}. Supported values: logging, sendgrid, resend`,
        );
      },
    },
  ],
  exports: [EMAIL_PROVIDER],
})
export class ProvidersModule {}
