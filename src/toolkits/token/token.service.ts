import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {getJwtConfig} from '../../_config/_jwt.config';

@Injectable()
export class TokenService extends JwtService {
  constructor() {
    const jwtConfig = getJwtConfig();
    const config = {
      secret: jwtConfig.secret,
      signOptions: {expiresIn: jwtConfig.expiresIn},
    };
    super(config);
  }

  getTokenFromHttpRequest(request: Request): string {
    return request.headers['authorization'].split(' ')[1];
  }

  decodeToken(token: string): string | {[key: string]: any} | null {
    return this.decode(token);
  }
}
