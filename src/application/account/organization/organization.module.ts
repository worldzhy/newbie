import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../toolkits/prisma/prisma.module';
import {OrganizationController} from './organization.controller';
import {OrganizationService} from './organization.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
