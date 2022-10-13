import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {UserJwtStatus} from '@prisma/client';
import {PrismaService} from '../../../../../toolkits/prisma/prisma.service';
import {getJwtConfig} from '../../../../../_config/_jwt.config';

@Injectable()
export class UserJwtService {
  private prisma = new PrismaService();
  private jwtService: JwtService;

  constructor() {
    const jwtConfig = getJwtConfig();
    const config = {
      secret: jwtConfig.secret,
      signOptions: {expiresIn: jwtConfig.expiresIn},
    };

    this.jwtService = new JwtService(config);
  }

  async createJWT(payload: {userId: string; sub: string}) {
    const jwt = this.jwtService.sign(payload);

    return await this.prisma.userJwt.create({
      data: {
        userId: payload.userId,
        token: jwt,
        status: UserJwtStatus.ACTIVE,
      },
    });
  }

  async inactivateJWT(userId: string, accessToken: string) {
    return await this.prisma.userJwt.updateMany({
      where: {AND: [{userId: userId}, {token: accessToken}]},
      data: {status: UserJwtStatus.INACTIVE},
    });
  }

  async inactivateJWTs(userId: string) {
    return await this.prisma.userJwt.updateMany({
      where: {userId: userId},
      data: {status: UserJwtStatus.INACTIVE},
    });
  }

  parseJWT(token: string): string | {[key: string]: any} | null {
    try {
      const arr = token.split(' ');
      return this.jwtService.decode(arr[1]);
    } catch (error) {
      throw error;
    }
  }

  /* End */
}
