import { Module } from "@nestjs/common";
import { UserRegistrationHandler } from "./user-registration.handler";
import { RabbitMqUserRegisteredConsumer } from "./rabbitmq-user-registered.consumer";

@Module({
  providers: [UserRegistrationHandler, RabbitMqUserRegisteredConsumer],
})
export class EventHandlersModule {}
