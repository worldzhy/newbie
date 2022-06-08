import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {OrganizationController} from './organization.controller';
import {OrganizationService} from './organization.service';
import {ValidatorModule} from '../../../_validator/_validator.module';

@Module({
  imports: [PrismaModule, ValidatorModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
