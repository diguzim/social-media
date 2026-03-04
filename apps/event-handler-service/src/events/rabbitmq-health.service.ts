import { Injectable } from "@nestjs/common";

export interface RabbitMqHealthState {
  connected: boolean;
  exchange: string;
  queue: string;
  url: string;
  lastError: string | null;
}

@Injectable()
export class RabbitMqHealthService {
  private state: RabbitMqHealthState = {
    connected: false,
    exchange: "",
    queue: "",
    url: "",
    lastError: null,
  };

  markConnected(
    config: Pick<RabbitMqHealthState, "exchange" | "queue" | "url">,
  ) {
    this.state = {
      connected: true,
      exchange: config.exchange,
      queue: config.queue,
      url: config.url,
      lastError: null,
    };
  }

  markDisconnected(errorMessage: string | null) {
    this.state = {
      ...this.state,
      connected: false,
      lastError: errorMessage,
    };
  }

  getStatus(): RabbitMqHealthState {
    return this.state;
  }
}
