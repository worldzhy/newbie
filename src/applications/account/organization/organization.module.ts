import {Module} from '@nestjs/common';
import {OrganizationController} from './organization.controller';
import {OrganizationService} from './organization.service';
import {RoleModule} from './role/role.module';
import {UserModule} from './user/user.module';

@Module({
  imports: [RoleModule, UserModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
