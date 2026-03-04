import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(5000);
  console.log("Event handler service is running on port 5000");
}

bootstrap();
