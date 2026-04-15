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
import * as Sentry from "@sentry/node";
import { EmailService } from "../email/email.service";

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
export class RabbitMqUserEventsConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMqUserEventsConsumer.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  private readonly rabbitMqUrl =
    process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672";
  private readonly exchange =
    process.env.RABBITMQ_EXCHANGE ?? EVENT_BUS.EXCHANGE;
  private readonly queueName =
    process.env.RABBITMQ_EMAIL_QUEUE ?? "social-media.email-delivery";

  constructor(private readonly emailService: EmailService) {}

  async onModuleInit(): Promise<void> {
    try {
      this.connection = await connectRabbitMqWithRetry(
        this.logger,
        this.rabbitMqUrl,
      );
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

      void channel.consume(this.queueName, (msg) => {
        if (!msg) {
          return;
        }

        const handleMessage = async () => {
          const routingKey = msg.fields.routingKey;
          const parsedEvent = JSON.parse(
            msg.content.toString("utf-8"),
          ) as unknown;

          if (routingKey === USER_EVENTS.REGISTERED) {
            const event = parsedEvent as UserRegisteredEvent;
            await this.emailService.sendVerificationEmail({
              to: event.email,
              name: event.name,
              verificationToken: event.verificationToken,
            });
            return;
          }

          if (routingKey === USER_EVENTS.EMAIL_VERIFICATION_REQUESTED) {
            const event = parsedEvent as VerificationEmailRequestedEvent;
            await this.emailService.sendVerificationEmail({
              to: event.email,
              name: event.name,
              verificationToken: event.verificationToken,
            });
            return;
          }

          throw new Error(`Unsupported routing key: ${routingKey}`);
        };

        void handleMessage()
          .then(() => {
            channel.ack(msg);
          })
          .catch((error: unknown) => {
            Sentry.captureException(error, {
              tags: {
                service: "email-service",
                component: "rabbitmq-user-events-consumer",
              },
              extra: {
                queue: this.queueName,
                exchange: this.exchange,
                routingKey: msg.fields.routingKey,
                message: msg.content.toString("utf-8"),
              },
            });
            this.logger.error(
              `Failed to process message: ${error instanceof Error ? error.message : String(error)}`,
            );
            channel.nack(msg, false, false);
          });
      });

      this.logger.log(
        `Email service consuming '${USER_EVENTS.REGISTERED}' and '${USER_EVENTS.EMAIL_VERIFICATION_REQUESTED}' from queue '${this.queueName}'`,
      );
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          service: "email-service",
          component: "rabbitmq-user-events-consumer",
          phase: "startup",
        },
        extra: {
          queue: this.queueName,
          exchange: this.exchange,
          rabbitMqUrl: this.rabbitMqUrl,
        },
      });
      this.logger.error(
        `RabbitMQ consumer startup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
