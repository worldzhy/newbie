import {Module} from '@nestjs/common';
import {FrameworkModule} from '@framework/framework.module';
import {MicroservicesModule} from '@microservices/microservices.module';

import {ApplicationController} from './application.controller';
import {DataboardModule} from './databoard/databoard.module';
import {DatasourceModule} from './datasource/datasource.module';
import {DatatransModule} from './datatrans/datatrans.module';

@Module({
  imports: [
    FrameworkModule,
    MicroservicesModule,

    DataboardModule,
    DatasourceModule,
    DatatransModule,
  ],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
