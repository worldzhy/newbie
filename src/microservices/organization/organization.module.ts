import {Global, Module} from '@nestjs/common';
import {OrganizationController} from './organization.controller';
import {OrganizationService} from './organization.service';

@Global()
@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
