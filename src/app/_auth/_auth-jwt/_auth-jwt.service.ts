import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from '../../../_prisma/_prisma.service';
import {JwtStatus} from '@prisma/client';

@Injectable()
export class AuthJwtService {
  private prisma = new PrismaService();
  private jwtService: JwtService;
  private jwtSecret = process.env.JWT_SECRET;

  constructor() {
    const config = {
      secret: this.jwtSecret,
      signOptions: {expiresIn: process.env.JWT_EXPIRES_IN},
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
    return await this.prisma.jsonWebToken.create({
      data: {
        userId: payload.userId,
        token: jwt,
        status: JwtStatus.ACTIVE,
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
    return await this.prisma.jsonWebToken.updateMany({
      where: {
        AND: [{userId: userId}, {token: accessToken}],
      },
      data: {
        status: JwtStatus.INACTIVE,
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
    return await this.prisma.jsonWebToken.updateMany({
      where: {
        userId: userId,
      },
      data: {
        status: JwtStatus.INACTIVE,
      },
    });
  }

  /* End */
}
