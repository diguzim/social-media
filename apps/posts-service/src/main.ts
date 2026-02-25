import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AllExceptionsFilter } from "@repo/exception-filters";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: parseInt(process.env.PORT || "4001", 10),
      },
    },
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen();
}
bootstrap();
