import {Module} from '@nestjs/common';
import {PrismaModule} from '../../_prisma/_prisma.module';
import {InfrastructureController} from './infrastructure.controller';
import {Database} from './code/rds.stack';
import {FileManager} from './code/s3.stack';
import {Network} from './code/vpc.stack';

@Module({
  imports: [PrismaModule],
  controllers: [InfrastructureController],
  providers: [Database, FileManager, Network],
  exports: [Database, FileManager, Network],
})
export class InfrastructureModule {}
