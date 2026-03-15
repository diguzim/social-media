import { Module } from "@nestjs/common";
import { UserRegistrationHandler } from "./user-registration.handler";
import { RabbitMqUserRegisteredConsumer } from "./rabbitmq-user-registered.consumer";
import { RabbitMqHealthService } from "./rabbitmq-health.service";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [EmailModule],
  providers: [
    UserRegistrationHandler,
    RabbitMqUserRegisteredConsumer,
    RabbitMqHealthService,
  ],
  exports: [RabbitMqHealthService],
})
export class EventHandlersModule {}
