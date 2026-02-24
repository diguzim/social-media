import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { correlationIdStorage } from "./correlation-id.storage";

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const data = context.switchToRpc().getData();
    const correlationId = data?.correlationId || "unknown";
    const userId = data?.userId ?? data?.authorId;

    // Wrap the entire handler execution in AsyncLocalStorage context
    return new Observable((subscriber) => {
      correlationIdStorage.run(
        { correlationId, userId, startTime: Date.now() },
        () => {
          next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        },
      );
    });
  }
}
