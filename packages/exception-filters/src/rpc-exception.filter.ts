import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Log the full error for debugging
    this.logger.error("Exception caught in API Gateway:", {
      name: exception?.name,
      message: exception?.message,
      error: exception?.error,
      status: exception?.status,
      statusCode: exception?.statusCode,
    });

    // Handle RpcException from microservices
    // The error payload is nested in the exception
    let errorPayload = null;

    if (exception instanceof RpcException) {
      errorPayload = exception.getError();
    } else if (exception?.error) {
      errorPayload = exception.error;
    } else {
      errorPayload = exception;
    }

    // Extract status code and message from the error payload
    const statusCode =
      errorPayload?.statusCode ||
      errorPayload?.status ||
      exception?.status ||
      HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      errorPayload?.message || exception?.message || "Internal server error";

    // Ensure statusCode is numeric
    const numericStatus =
      typeof statusCode === "number"
        ? statusCode
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(numericStatus).json({
      statusCode: numericStatus,
      message,
      error: this.getErrorName(numericStatus),
    });
  }

  private getErrorName(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return "Bad Request";
      case HttpStatus.UNAUTHORIZED:
        return "Unauthorized";
      case HttpStatus.FORBIDDEN:
        return "Forbidden";
      case HttpStatus.NOT_FOUND:
        return "Not Found";
      case HttpStatus.CONFLICT:
        return "Conflict";
      default:
        return "Internal Server Error";
    }
  }
}
