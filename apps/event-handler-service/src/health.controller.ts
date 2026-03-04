import { Controller, Get } from "@nestjs/common";
import { RabbitMqHealthService } from "./events/rabbitmq-health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly rabbitMqHealthService: RabbitMqHealthService) {}

  @Get()
  getHealth() {
    const rabbitmq = this.rabbitMqHealthService.getStatus();

    return {
      status: rabbitmq.connected ? "ok" : "degraded",
      service: "event-handler-service",
      rabbitmq,
      timestamp: new Date().toISOString(),
    };
  }
}
