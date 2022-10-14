import {AbilityBuilder, PureAbility} from '@casl/ability';
import {PrismaQuery, createPrismaAbility} from '@casl/prisma';
import {Injectable} from '@nestjs/common';
import {PermissionAction, Prisma, User, UserToRole} from '@prisma/client';

export type AppAbility = PureAbility<
  [PermissionAction, Prisma.ModelName | 'all'],
  PrismaQuery
>;

@Injectable()
export class CaslAbilityFactory {
  async createAbility(user: User) {
    const {can, cannot, build} = new AbilityBuilder<AppAbility>(
      createPrismaAbility
    );

    user['userToRoles'].map((userToRole: UserToRole) => {
      if (userToRole['role'].name === 'Admin') {
        // 'manage' and 'all' are special keywords in CASL. manage represents any action and all represents any subject.
        can('manage', 'all');
      }
    });

    // Customize user permissions here

    return build();
  }
}
