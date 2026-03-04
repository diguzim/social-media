import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { connect, type Channel, type ChannelModel } from "amqplib";
import { EVENT_BUS, USER_EVENTS, type UserRegisteredEvent } from "@repo/events";
import { UserRegistrationHandler } from "./user-registration.handler";
import { RabbitMqHealthService } from "./rabbitmq-health.service";

@Injectable()
export class RabbitMqUserRegisteredConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMqUserRegisteredConsumer.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  private readonly rabbitMqUrl =
    process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672";
  private readonly exchange =
    process.env.RABBITMQ_EXCHANGE ?? EVENT_BUS.EXCHANGE;
  private readonly queueName =
    process.env.RABBITMQ_USER_REGISTERED_QUEUE ??
    EVENT_BUS.USER_REGISTERED_QUEUE;

  constructor(
    private readonly userRegistrationHandler: UserRegistrationHandler,
    private readonly rabbitMqHealthService: RabbitMqHealthService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.connection = await connect(this.rabbitMqUrl);
      const channel = await this.connection.createChannel();
      this.channel = channel;

      await channel.assertExchange(this.exchange, "topic", {
        durable: true,
      });
      await channel.assertQueue(this.queueName, { durable: true });
      await channel.bindQueue(
        this.queueName,
        this.exchange,
        USER_EVENTS.REGISTERED,
      );

      await channel.consume(this.queueName, async (msg) => {
        if (!msg) {
          return;
        }

        try {
          const event = JSON.parse(
            msg.content.toString("utf-8"),
          ) as UserRegisteredEvent;

          await this.userRegistrationHandler.handleUserRegistered(event);
          channel.ack(msg);
        } catch (error) {
          this.logger.error(
            `Failed to process message: ${error instanceof Error ? error.message : String(error)}`,
          );
          channel.nack(msg, false, false);
        }
      });

      this.rabbitMqHealthService.markConnected({
        exchange: this.exchange,
        queue: this.queueName,
        url: this.rabbitMqUrl,
      });

      this.logger.log(
        `Consuming '${USER_EVENTS.REGISTERED}' from queue '${this.queueName}'`,
      );
    } catch (error) {
      this.rabbitMqHealthService.markDisconnected(
        error instanceof Error ? error.message : String(error),
      );
      this.logger.error(
        `RabbitMQ consumer startup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.rabbitMqHealthService.markDisconnected("consumer stopped");
    await this.channel?.close();
    await this.connection?.close();
  }
}
