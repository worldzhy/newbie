import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {OrganizationController} from './organization.controller';
import {OrganizationService} from './organization.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
