import { Injectable } from "@nestjs/common";

export type DeliveryStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "failed"
  | "bounced";

export interface DeliveryRecord {
  id: string;
  providerMessageId: string | null;
  to: string[];
  from: string;
  subject: string;
  body: string;
  status: DeliveryStatus;
  provider: string;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class EmailDeliveryStore {
  private readonly records = new Map<string, DeliveryRecord>();

  createQueued(params: {
    to: string[];
    from: string;
    subject: string;
    body: string;
    provider: string;
  }): DeliveryRecord {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const record: DeliveryRecord = {
      id,
      providerMessageId: null,
      to: params.to,
      from: params.from,
      subject: params.subject,
      body: params.body,
      status: "queued",
      provider: params.provider,
      attempts: 0,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(id, record);
    return record;
  }

  markSending(id: string): DeliveryRecord | null {
    const record = this.records.get(id);
    if (!record) {
      return null;
    }

    record.status = "sending";
    record.attempts += 1;
    record.updatedAt = new Date().toISOString();
    return record;
  }

  markSent(
    id: string,
    providerMessageId: string | null,
  ): DeliveryRecord | null {
    const record = this.records.get(id);
    if (!record) {
      return null;
    }

    record.status = "sent";
    record.providerMessageId = providerMessageId;
    record.updatedAt = new Date().toISOString();
    return record;
  }

  markFailed(id: string, errorMessage: string): DeliveryRecord | null {
    const record = this.records.get(id);
    if (!record) {
      return null;
    }

    record.status = "failed";
    record.lastError = errorMessage;
    record.updatedAt = new Date().toISOString();
    return record;
  }

  getById(id: string): DeliveryRecord | null {
    return this.records.get(id) ?? null;
  }
}
