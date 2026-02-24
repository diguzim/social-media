import { AsyncLocalStorage } from 'node:async_hooks';

export interface CorrelationContext {
  correlationId: string;
  userId?: string;
  startTime?: number;
}

export const correlationIdStorage = new AsyncLocalStorage<CorrelationContext>();

export function getCorrelationId(): string | undefined {
  return correlationIdStorage.getStore()?.correlationId;
}

export function setCorrelationId(correlationId: string): void {
  const store = correlationIdStorage.getStore();
  if (store) {
    store.correlationId = correlationId;
  }
}

export function getUserId(): string | undefined {
  return correlationIdStorage.getStore()?.userId;
}

export function setUserId(userId: string | undefined): void {
  const store = correlationIdStorage.getStore();
  if (store) {
    store.userId = userId;
  }
}

export function startRequestTimer(): void {
  const store = correlationIdStorage.getStore();
  if (store) {
    store.startTime = Date.now();
  }
}

export function getRequestDurationMs(): number | undefined {
  const startTime = correlationIdStorage.getStore()?.startTime;
  if (!startTime) {
    return undefined;
  }

  return Date.now() - startTime;
}
