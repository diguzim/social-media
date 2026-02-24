import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { logContextStorage } from "./log-context.storage.js";

@Injectable()
export class LogContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const data = context.switchToRpc().getData();
    const correlationId = data?.correlationId || "unknown";
    const userId = data?.userId ?? data?.authorId;

    return new Observable((subscriber) => {
      logContextStorage.run(
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
