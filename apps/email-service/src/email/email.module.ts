import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { EmailDeliveryStore } from "./email-delivery.store";
import { ProvidersModule } from "../infra/providers/providers.module";

@Module({
  imports: [ProvidersModule],
  controllers: [EmailController],
  providers: [EmailService, EmailDeliveryStore],
  exports: [EmailService],
})
export class EmailModule {}
