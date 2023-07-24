import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-custom';
import {Request} from 'express';
import {RefreshTokenService} from 'src/toolkit/token/token.service';
import {AccountService} from '../../account.service';
import {UserRefreshTokenService} from '../../user/refreshToken/refreshToken.service';

@Injectable()
export class AuthRefreshStrategy extends PassportStrategy(
  Strategy,
  'passport-custom.refresh'
) {
  private accountService = new AccountService();
  private refreshTokenService = new RefreshTokenService();
  private userRefreshTokenService = new UserRefreshTokenService();

  constructor() {
    super();
  }

  /**
   * 'validate' function must be implemented.
   */
  async validate(req: Request): Promise<boolean> {
    const refreshToken = req.cookies.refreshToken;

    // [step 1] Validate refresh token.
    try {
      this.refreshTokenService.verifyToken(refreshToken);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'TokenExpiredError') {
        // If expired refresh token is used, invalidate all tokens to force user to login
        const userData = this.refreshTokenService.decodeToken(refreshToken) as {
          userId: string;
        };
        await this.accountService.invalidateTokens(userData.userId);
      }
      throw new UnauthorizedException('Token is incorrect.');
    }

    // [step 2] Verify that refresh token is in db
    try {
      await this.userRefreshTokenService.findFirstOrThrow({
        where: {token: refreshToken},
      });
    } catch (err: unknown) {
      // If refresh token is valid but not in db must have logout already and bad actor might be trying to use it, invalidate all tokens to force user to login
      const userData = this.refreshTokenService.decodeToken(refreshToken) as {
        userId: string;
      };
      await this.accountService.invalidateTokens(userData.userId);
      throw new UnauthorizedException('Token is incorrect.');
    }

    return true;
  }
}
