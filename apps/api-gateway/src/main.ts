import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common/services/console-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'ApiGateway',
    }),
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
