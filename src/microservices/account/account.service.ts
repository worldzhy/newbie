import {Injectable, NotFoundException} from '@nestjs/common';
import {UserStatus} from '@prisma/client';
import {UserService} from './user/user.service';
import {AccessTokenService} from '@microservices/account/security/token/access-token.service';
import {PrismaService} from '@framework/prisma/prisma.service';
import {Request} from 'express';
import {RoleService} from './role/role.service';
import {TokenService} from './security/token/token.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly accessTokenService: AccessTokenService,
    private readonly tokenService: TokenService
  ) {}

  async me(request: Request) {
    // [step 1] Parse token from http request header.
    const accessToken =
      this.accessTokenService.getTokenFromHttpRequest(request);

    // [step 2] Get UserToken record.
    const userToken = await this.prisma.accessToken.findFirstOrThrow({
      where: {token: accessToken},
    });

    // [step 3] Get user.
    return await this.prisma.user.findUniqueOrThrow({
      where: {id: userToken.userId},
      select: {
        id: true,
        email: true,
        phone: true,
        roles: true,
        profile: true,
        profiles: true,
        organization: true,
      },
    });
  }

  async isAdmin(request: Request) {
    // [step 1] Parse token from http request header.
    const accessToken =
      this.accessTokenService.getTokenFromHttpRequest(request);

    // [step 2] Get UserToken record.
    const userToken = await this.prisma.accessToken.findFirstOrThrow({
      where: {token: accessToken},
    });

    // [step 3] Get user.
    const count = await this.prisma.user.count({
      where: {
        id: userToken.userId,
        roles: {some: {name: RoleService.RoleName.ADMIN}},
      },
    });

    return count > 0 ? true : false;
  }

  async login(account: string) {
    // [step 1] Get user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      throw new NotFoundException('Your account does not exist.');
    }

    // [step 2] Check if the account is active.
    if (user.status === UserStatus.INACTIVE) {
      throw new NotFoundException(
        'You have closed your account, do you want to recover it?'
      );
    }

    // [step 3] Disable active JSON web token if existed.
    await this.tokenService.invalidateAccessTokenAndRefreshToken(user.id);

    // [step 4] Update last login time.
    await this.prisma.user.update({
      where: {id: user.id},
      data: {lastLoginAt: new Date()},
    });

    // [step 5] Generate new tokens.
    return await this.tokenService.generateAccessTokenAndRefreshToken({
      userId: user.id,
      sub: account,
    });
  }

  /* End */
}
