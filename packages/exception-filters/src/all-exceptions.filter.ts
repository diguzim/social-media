import { Catch, RpcExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { RpcException } from "@nestjs/microservices";

@Catch()
export class AllExceptionsFilter implements RpcExceptionFilter<any> {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    // If it's already an RpcException, just throw it
    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }

    // For NestJS HTTP exceptions (like ConflictException, NotFoundException, etc.)
    // Extract the status code and message to preserve them
    const status = exception?.getStatus?.() || exception?.status || 500;
    const message = exception?.message || "Internal server error";
    const response = exception?.getResponse?.();

    // Create a serializable error object
    const error = {
      statusCode: status,
      message: typeof response === "string" ? response : message,
      error: exception?.name || "Error",
    };

    // Wrap in RpcException to properly serialize over TCP
    return throwError(() => new RpcException(error));
  }
}
