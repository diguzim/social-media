import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { logContextStorage } from "./log-context.storage.js";

@Injectable()
export class LogContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers["x-correlation-id"] as string) || randomUUID();

    res.setHeader("x-correlation-id", correlationId);

    logContextStorage.run({ correlationId, startTime: Date.now() }, () => {
      next();
    });
  }
}
