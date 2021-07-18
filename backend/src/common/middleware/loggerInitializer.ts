import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";
import { Request, Response, NextFunction } from "express";
import { Logger } from "../../utils/logger";
import { Inject } from 'typedi';
@Middleware({ type: "before" })
export class LoggerInitializer implements ExpressMiddlewareInterface {
  @Inject()
  private readonly logger: Logger;
  use(request: Request, response: Response, next: NextFunction): void {
    request.logger = this.logger;
    next();
  }

}