import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { correlationIdStorage } from './correlation-id.storage';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || randomUUID();

    // Set response header so client can track
    res.setHeader('x-correlation-id', correlationId);

    // Run next handlers in this async context
    correlationIdStorage.run({ correlationId, startTime: Date.now() }, () => {
      next();
    });
  }
}
