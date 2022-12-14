import {Module} from '@nestjs/common';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {LocationModule} from '../../../microservices/location/location.module';
import {UserProfileModule} from './profile/profile.module';
import {UserTokenModule} from './token/token.module';
import {OrganizationModule} from './organization/organization.module';
import {RoleModule} from './role/role.module';

@Module({
  imports: [
    OrganizationModule,
    RoleModule,
    LocationModule,
    UserProfileModule,
    UserTokenModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
