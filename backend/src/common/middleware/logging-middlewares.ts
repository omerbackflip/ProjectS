import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { Inject } from 'typedi';
import { Logger } from '../../utils/logger';

@Middleware({ type: 'after' })
export class AfterLoggingMiddleware
    implements ExpressMiddlewareInterface {

    @Inject()
    private readonly logger: Logger;

    use(req: Request, res: Response, next: NextFunction) {

        if (!req.logger)
            req.logger = this.logger;

        req.logger.logInfo(
            `REQUEST COMPLETED - ${req.method} ${res.req.originalUrl} ${res.statusCode} ${res.statusMessage ? res.statusMessage : ""}`,
            res.req.headers
        );
        next();
    }
}

@Middleware({ type: 'before' })
export class BeforeLoggingMiddleware
    implements ExpressMiddlewareInterface {

    @Inject()
    private readonly logger: Logger;
        
    use(req: Request, res: Response, next: NextFunction) {

        if (!req.logger)
            req.logger = this.logger;

        req.logger.logInfo(
            `REQUEST INITIATED - ${req.method} ${res.req.originalUrl} ${res.statusCode} ${res.statusMessage ? res.statusMessage : ""}`,
            res.req.headers,
            req.body,
        );
        next();
    }
}

module.exports = { AfterLoggingMiddleware, BeforeLoggingMiddleware }