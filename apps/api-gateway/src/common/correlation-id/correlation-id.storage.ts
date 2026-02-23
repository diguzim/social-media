import { AsyncLocalStorage } from 'node:async_hooks';

export interface CorrelationContext {
  correlationId: string;
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
