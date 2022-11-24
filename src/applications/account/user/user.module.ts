import {Module} from '@nestjs/common';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {UserProfileModule} from './profile/profile.module';
import {UserTokenModule} from './token/token.module';
import {OrganizationModule} from './organization/organization.module';
import {RoleModule} from './role/role.module';

@Module({
  imports: [OrganizationModule, RoleModule, UserProfileModule, UserTokenModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
