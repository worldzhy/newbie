import {Module} from '@nestjs/common';
import {PrismaModule} from '../../_prisma/_prisma.module';
import {InfrastructureController} from './infrastructure.controller';
import {Database} from './program/database.program';
import {FileManager} from './program/filemanager.program';
import {Network} from './program/network.program';

@Module({
  imports: [PrismaModule],
  controllers: [InfrastructureController],
  providers: [Database, FileManager, Network],
  exports: [Database, FileManager, Network],
})
export class InfrastructureModule {}
