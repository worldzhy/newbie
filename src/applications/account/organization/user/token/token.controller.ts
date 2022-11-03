import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  PermissionAction,
  Prisma,
  User,
  UserToken,
  UserTokenStatus,
} from '@prisma/client';
import {RequirePermission} from 'src/applications/account/authorization/authorization.decorator';
import {UserService} from '../user.service';
import {UserTokenService} from './token.service';

@ApiTags('[Application] Account / Organization / User / Token')
@ApiBearerAuth()
@Controller('user-tokens')
export class UserTokenController {
  constructor(private userTokenService: UserTokenService) {}

  @Get(':token/user')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.UserToken)
  @ApiParam({
    name: 'token',
    schema: {type: 'string'},
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MzBmYzE2OS1hMzdlLTQ2M2QtOGIyMi04NzdmNWIyOGU2Y2MiLCJzdWIiOiJhZG1pbiIsImlhdCI6MTY2NzQ1NzE1NywiZXhwIjoxNjY3NDYzMTU3fQ.IHzGGzZu0bUWObW1BEmXR2WeTm6nv9md7EFTsTShatE',
  })
  async getUserByToken(@Param('token') token: string): Promise<UserToken> {
    const userToken = await this.userTokenService.findFirstOrThrow({
      where: {token: token, status: UserTokenStatus.ACTIVE},
    });

    const userService = new UserService();
    userToken['user'] = await userService.findUniqueOrThrowWithRoles({
      where: {id: userToken.userId},
    });

    return userToken;
  }

  /* End */
}
