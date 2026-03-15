import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { connect, type Channel, type ChannelModel } from "amqplib";
import {
  EVENT_BUS,
  USER_EVENTS,
  type UserRegisteredEvent,
  type VerificationEmailRequestedEvent,
} from "@repo/events";
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
      await channel.bindQueue(
        this.queueName,
        this.exchange,
        USER_EVENTS.EMAIL_VERIFICATION_REQUESTED,
      );

      await channel.consume(this.queueName, async (msg) => {
        if (!msg) {
          return;
        }

        try {
          const routingKey = msg.fields.routingKey;
          const parsedEvent = JSON.parse(msg.content.toString("utf-8"));

          if (routingKey === USER_EVENTS.REGISTERED) {
            await this.userRegistrationHandler.handleUserRegistered(
              parsedEvent as UserRegisteredEvent,
            );
          } else if (routingKey === USER_EVENTS.EMAIL_VERIFICATION_REQUESTED) {
            await this.userRegistrationHandler.handleVerificationEmailRequested(
              parsedEvent as VerificationEmailRequestedEvent,
            );
          } else {
            throw new Error(`Unsupported routing key: ${routingKey}`);
          }

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
        `Consuming '${USER_EVENTS.REGISTERED}' and '${USER_EVENTS.EMAIL_VERIFICATION_REQUESTED}' from queue '${this.queueName}'`,
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
