import {Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response, raw} from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    raw({type: '*/*'})(req, res, next);
  }
}
