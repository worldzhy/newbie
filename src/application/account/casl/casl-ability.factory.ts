import {AbilityBuilder, createMongoAbility, defineAbility} from '@casl/ability';
import {createPrismaAbility, Subjects} from '@casl/prisma';
import {createAbilityFactory} from '@casl/prisma/dist/types/createAbilityFactory';
import {Injectable} from '@nestjs/common';
import {User, UserProfile} from '@prisma/client';

enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// type AppSubjects = Subjects<{
//   User: User;
//   UserProfile: UserProfile;
// }>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const {can, cannot, build} = new AbilityBuilder(createMongoAbility);

    if (user) {
      can('manage', 'all'); // read-write access to everything
    } else {
      can('read', 'all'); // read-only access to everything
    }

    can(Action.Update, 'User', {name: 'henry'});

    return build();
  }
}
