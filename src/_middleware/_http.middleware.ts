import {Injectable, NestMiddleware} from '@nestjs/common';
import {Request, Response, NextFunction} from 'express';
import {CustomLoggerService} from '../_logger/_logger.service';

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  private readonly logger = new CustomLoggerService('HttpMiddleware');

  use(request: Request, response: Response, next: NextFunction) {
    response.on('finish', () => {
      const {method, originalUrl} = request;
      const {statusCode, statusMessage} = response;

      // [step 1] Assemble log content.
      let content = `${statusCode} ${statusMessage} >> ${method} ${originalUrl}`;
      if (request.body && Object.keys(request.body).length > 0) {
        content += ` ${JSON.stringify(request.body)}`;
      }

      // [step 2] Write log.
      if (statusCode >= 500) {
        return this.logger.error(content);
      } else if (statusCode >= 400) {
        return this.logger.warn(content);
      } else {
        return this.logger.log(content);
      }
    });

    next();
  }
}
