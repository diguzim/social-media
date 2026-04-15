import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { connect, type Channel, type ChannelModel } from 'amqplib';
import { EVENT_BUS } from '@repo/events';

const RABBITMQ_MAX_CONNECT_ATTEMPTS = 10;
const RABBITMQ_INITIAL_RETRY_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function connectRabbitMqWithRetry(
  logger: Logger,
  rabbitMqUrl: string,
  maxAttempts = RABBITMQ_MAX_CONNECT_ATTEMPTS,
  initialDelayMs = RABBITMQ_INITIAL_RETRY_DELAY_MS,
): Promise<ChannelModel> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await connect(rabbitMqUrl);
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        break;
      }

      const delayMs = Math.min(initialDelayMs * 2 ** (attempt - 1), 10_000);
      logger.warn(
        `RabbitMQ connection attempt ${attempt}/${maxAttempts} failed. Retrying in ${delayMs}ms. Reason: ${error instanceof Error ? error.message : String(error)}`,
      );
      await delay(delayMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

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
      this.connection = await connectRabbitMqWithRetry(
        this.logger,
        this.rabbitMqUrl,
      );
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
