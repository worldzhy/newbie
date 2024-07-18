import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {AccessTokenService} from './access-token.service';
import {RefreshTokenService} from './refresh-token.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  async generateAccessTokenAndRefreshToken(
    payload: {
      userId: string;
      sub: string;
    },
    refreshTokenOptions?: {expiresIn: number}
  ) {
    // [step 1] Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.prisma.accessToken.create({
        data: {
          userId: payload.userId,
          token: this.accessTokenService.sign(payload),
        },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId: payload.userId,
          token: this.refreshTokenService.sign(payload, refreshTokenOptions),
        },
      }),
    ]);

    // [step 2] Parse access token to get the expiry.
    const accessTokenInfo = this.accessTokenService.decodeToken(
      accessToken.token
    ) as {iat: number; exp: number};
    accessToken['tokenExpiresInSeconds'] =
      accessTokenInfo.exp - accessTokenInfo.iat;

    return {
      accessToken,
      refreshToken: {
        ...refreshToken,
        cookie: {
          name: this.refreshTokenService.cookieName,
          options: this.refreshTokenService.getCookieOptions(
            refreshToken.token
          ),
        },
      },
    };
  }

  async invalidateAccessTokenAndRefreshToken(userId: string) {
    await Promise.all([
      this.prisma.accessToken.deleteMany({
        where: {userId},
      }),
      this.prisma.refreshToken.deleteMany({
        where: {userId},
      }),
    ]);
  }
}
