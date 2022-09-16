import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {UserJwtStatus} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';
import {getJwtConfig} from '../../../../_config/_jwt.config';

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

  /**
   * Create a JWT
   *
   * @param {{username: string; sub: string}} payload
   * @returns
   * @memberof AuthJwtService
   */
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

  /**
   * Inactivate user's specific JWT
   *
   * @param {string} userId
   * @param {string} accessToken
   * @returns
   * @memberof UserService
   */
  async inactivateJWT(userId: string, accessToken: string) {
    return await this.prisma.userJwt.updateMany({
      where: {
        AND: [{userId: userId}, {token: accessToken}],
      },
      data: {
        status: UserJwtStatus.INACTIVE,
      },
    });
  }

  /**
   * Inactivate all the user's JWTs
   *
   * @param {string} userId
   * @returns
   * @memberof UserService
   */
  async inactivateJWTs(userId: string) {
    return await this.prisma.userJwt.updateMany({
      where: {
        userId: userId,
      },
      data: {
        status: UserJwtStatus.INACTIVE,
      },
    });
  }

  /* End */
}
