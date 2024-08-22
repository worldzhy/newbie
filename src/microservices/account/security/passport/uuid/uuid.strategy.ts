import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-custom';
import {Request} from 'express';
import {verifyUuid} from '@microservices/account/account.validator';
import {PrismaService} from '@framework/prisma/prisma.service';

@Injectable()
export class UuidStrategy extends PassportStrategy(Strategy, 'custom.uuid') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * 'validate' function must be implemented.
   */
  async validate(req: Request): Promise<boolean> {
    // [step 1] Guard statement.
    const uuid = req.body.uuid;
    if (!verifyUuid(uuid)) {
      throw new UnauthorizedException('The uuid is invaild.');
    }

    // [step 2] Validate uuid.
    const user = await this.prisma.user.findUnique({
      where: {id: uuid},
    });
    if (!user) {
      throw new UnauthorizedException('The uuid is incorrect.');
    }

    // [step 3] OK.
    return true;
  }
}
