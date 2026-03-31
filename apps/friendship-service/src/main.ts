import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AllExceptionsFilter } from "@repo/exception-filters";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: parseInt(process.env.PORT || "4005", 10),
      },
    },
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen();
}

void bootstrap();
