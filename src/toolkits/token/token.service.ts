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

  parse(token: string): string | {[key: string]: any} | null {
    try {
      const arr = token.split(' ');
      return this.decode(arr[1]);
    } catch (error) {
      throw error;
    }
  }
}
