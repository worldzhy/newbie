import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class AwsSecretKeyTokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(secretKey: string): string {
    return this.jwtService.sign({secretKey});
  }

  decode(token: string): string {
    const {secretKey} = this.jwtService.decode(token);
    return secretKey;
  }
}
