import {Module} from '@nestjs/common';
import {DatasourcePostgresqlController} from './postgresql.controller';
import {DatasourcePostgresqlService} from './postgresql.service';
import {PrismaModule} from '../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DatasourcePostgresqlController],
  providers: [DatasourcePostgresqlService],
  exports: [DatasourcePostgresqlService],
})
export class DatasourcePostgresqlModule {}
