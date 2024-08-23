import {ExecutionContext, Injectable} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from '@nestjs/passport';
import {PUBLIC_ENDPOINT} from './auth.constants';

@Injectable()
export class SaaSStarterAuthGuard extends AuthGuard('saas-starter') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  public canActivate(context: ExecutionContext) {
    const decoratorSkip =
      this.reflector.get(PUBLIC_ENDPOINT, context.getClass()) ||
      this.reflector.get(PUBLIC_ENDPOINT, context.getHandler());
    if (decoratorSkip) return true;
    return super.canActivate(context);
  }
}
