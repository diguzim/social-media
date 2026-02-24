import { AsyncLocalStorage } from "node:async_hooks";

export interface LogContext {
  correlationId: string;
  userId?: string;
  startTime?: number;
}

export const logContextStorage = new AsyncLocalStorage<LogContext>();

export function getCorrelationId(): string | undefined {
  return logContextStorage.getStore()?.correlationId;
}

export function setCorrelationId(correlationId: string): void {
  const store = logContextStorage.getStore();
  if (store) {
    store.correlationId = correlationId;
  }
}

export function getUserId(): string | undefined {
  return logContextStorage.getStore()?.userId;
}

export function setUserId(userId: string | undefined): void {
  const store = logContextStorage.getStore();
  if (store) {
    store.userId = userId;
  }
}

export function startRequestTimer(): void {
  const store = logContextStorage.getStore();
  if (store) {
    store.startTime = Date.now();
  }
}

export function getRequestDurationMs(): number | undefined {
  const startTime = logContextStorage.getStore()?.startTime;
  if (!startTime) {
    return undefined;
  }

  return Date.now() - startTime;
}
