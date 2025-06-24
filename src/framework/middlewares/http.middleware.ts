import {Logger, Injectable, NestMiddleware} from '@nestjs/common';
import {Request, Response, NextFunction} from 'express';

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  private loggerContext = 'HttpMiddleware';

  constructor(private readonly logger: Logger) {}

  use(request: Request, response: Response, next: NextFunction) {
    const startDate = new Date();

    response.on('finish', () => {
      // [step 1] Assemble log content.
      let authorizationKey = '';
      if (typeof request.query.api_key === 'string')
        authorizationKey = request.query.api_key.replace('Bearer ', '');
      else if (typeof request.headers['x-api-key'] === 'string')
        authorizationKey = request.headers['x-api-key'].replace('Bearer ', '');
      else if (request.headers.authorization)
        authorizationKey = request.headers.authorization.replace('Bearer ', '');

      const logObj = {
        date: startDate,
        duration: new Date().getTime() - startDate.getTime(),
        method: request.method,
        originalUrl: request.originalUrl,
        body: request.body,
        status: response.statusCode,
        authorization: authorizationKey,
      };

      // [step 2] Write log.
      return this.logger.log(JSON.stringify(logObj), this.loggerContext);
    });

    next();
  }
}
