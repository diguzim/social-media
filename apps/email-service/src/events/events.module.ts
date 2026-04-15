import { Module } from "@nestjs/common";
import { EmailModule } from "../email/email.module";
import { RabbitMqUserEventsConsumer } from "./rabbitmq-user-events.consumer";

@Module({
  imports: [EmailModule],
  providers: [RabbitMqUserEventsConsumer],
})
export class EventsModule {}
