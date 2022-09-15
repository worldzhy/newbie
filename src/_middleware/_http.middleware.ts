import {Injectable, NestMiddleware} from '@nestjs/common';
import {Request, Response, NextFunction} from 'express';
import {CustomLoggerService} from '../tools/logger/custom-logger.service';

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  private readonly logger = new CustomLoggerService('HttpMiddleware');

  use(request: Request, response: Response, next: NextFunction) {
    response.on('finish', () => {
      const {method, originalUrl} = request;
      const {statusCode, statusMessage} = response;

      // [step 1] Assemble log message.
      let message = `${statusCode} ${statusMessage} >> ${method} ${originalUrl}`;
      if (request.body && Object.keys(request.body).length > 0) {
        // const body =
        //   typeof request.body === 'string'
        //     ? request.body
        //     : JSON.stringify(request.body);

        // message += `${body}`;
        message += ` >> ${JSON.stringify(request.body)}`;
      }

      // [step 2] Write log.
      if (statusCode >= 500) {
        return this.logger.error(message);
      } else if (statusCode >= 400) {
        return this.logger.warn(message);
      } else {
        return this.logger.log(message);
      }
    });

    next();
  }
}
