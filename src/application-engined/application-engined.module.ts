import {Module} from '@nestjs/common';
import {Application0Module} from '@application0/application0.module';

import {ApplicationEnginedController} from './application-engined.controller';
import {DataboardModule} from './databoard/databoard.module';
import {DatasourceModule} from './datasource/datasource.module';
import {DatatransModule} from './datatrans/datatrans.module';

@Module({
  imports: [
    Application0Module, // BEAT IT!
    DataboardModule,
    DatasourceModule,
    DatatransModule,
  ],
  controllers: [ApplicationEnginedController],
})
export class ApplicationEnginedModule {}
