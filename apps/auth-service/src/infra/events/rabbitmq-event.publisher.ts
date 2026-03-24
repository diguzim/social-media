import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { connect, type Channel, type ChannelModel } from 'amqplib';
import { EVENT_BUS } from '@repo/events';

@Injectable()
export class RabbitMqEventPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqEventPublisher.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly rabbitMqUrl =
    process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';
  private readonly exchange =
    process.env.RABBITMQ_EXCHANGE ?? EVENT_BUS.EXCHANGE;

  async onModuleInit(): Promise<void> {
    try {
      this.connection = await connect(this.rabbitMqUrl);
      const channel = await this.connection.createChannel();
      this.channel = channel;
      await channel.assertExchange(this.exchange, 'topic', {
        durable: true,
      });
      this.logger.log(
        `Connected to RabbitMQ and exchange '${this.exchange}' is ready`,
      );
    } catch (error) {
      this.logger.warn(
        `RabbitMQ connection failed. Events will be skipped. Reason: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  publish<TPayload>(eventName: string, payload: TPayload): Promise<void> {
    if (!this.channel) {
      this.logger.warn(
        `Skipping event '${eventName}' because RabbitMQ is not connected`,
      );
      return Promise.resolve();
    }

    try {
      const wasPublished = this.channel.publish(
        this.exchange,
        eventName,
        Buffer.from(JSON.stringify(payload)),
        {
          persistent: true,
          contentType: 'application/json',
        },
      );

      if (!wasPublished) {
        this.logger.warn(
          `RabbitMQ publish returned false for event '${eventName}'`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to publish event '${eventName}': ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return Promise.resolve();
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
