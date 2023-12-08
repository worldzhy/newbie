import {Injectable} from '@nestjs/common';
import {User} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {verifyUuid} from '@toolkit/validators/user.validator';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The account supports uuid / email / phone.
   */
  async findByAccount(account: string): Promise<User | null> {
    if (verifyUuid(account)) {
      return await this.prisma.user.findUnique({where: {id: account}});
    } else {
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            {email: {equals: account, mode: 'insensitive'}},
            {phone: account},
          ],
        },
      });
      return users.length > 0 ? (users[0] as User) : null;
    }
  }

  async checkExistence(id: string) {
    const count = await this.prisma.user.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  withoutPassword(user: User) {
    const {password, ...others} = user;
    return others;
  }

  /* End */
}
