import {Module} from '@nestjs/common';
import {FrameworkModule} from '@framework/framework.module';
import {MicroserviceModule} from '@microservices/microservice.module';

import {ApplicationEnginedController} from './application-engined.controller';
import {DataboardModule} from './databoard/databoard.module';
import {DatasourceModule} from './datasource/datasource.module';
import {DatatransModule} from './datatrans/datatrans.module';

@Module({
  imports: [
    FrameworkModule,
    MicroserviceModule,

    DataboardModule,
    DatasourceModule,
    DatatransModule,
  ],
  controllers: [ApplicationEnginedController],
})
export class ApplicationEnginedModule {}
