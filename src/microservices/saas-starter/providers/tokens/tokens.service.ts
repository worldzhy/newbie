import {Injectable, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  decode,
  DecodeOptions,
  sign,
  SignOptions,
  verify,
  VerifyOptions,
} from 'jsonwebtoken';
import {INVALID_TOKEN} from '../../errors/errors.constants';

@Injectable()
export class TokensService {
  constructor(private configService: ConfigService) {}

  /**
   * Sign a JWT
   * @param subject - Subject
   * @param payload - Object payload
   * @param expiresIn - Expiry string (vercel/ms)
   * @param options - Signing options
   */
  signJwt(
    subject: string,
    payload: number | string | object | Buffer,
    expiresIn?: string,
    options?: SignOptions
  ) {
    if (typeof payload === 'number') payload = payload.toString();
    return sign(
      payload,
      this.configService.getOrThrow<string>(
        'microservices.saas-starter.security.jwtSecret'
      ),
      {
        ...options,
        subject,
        expiresIn,
      }
    );
  }

  /**
   * Verify and decode a JWT
   * @param subject - Subject
   * @param token - JWT
   * @param options - Verify options
   */
  verify<T>(subject: string, token: string, options?: VerifyOptions) {
    try {
      return verify(
        token,
        this.configService.getOrThrow<string>(
          'microservices.saas-starter.security.jwtSecret'
        ),
        {...options, subject}
      ) as any as T;
    } catch (error) {
      throw new UnauthorizedException(INVALID_TOKEN);
    }
  }

  /**
   * Decode a JWT without verifying it
   * @deprecated Use verify() instead
   * @param token - JWT
   * @param options - Decode options
   */
  decode<T>(token: string, options?: DecodeOptions) {
    return decode(token, options) as T;
  }
}
