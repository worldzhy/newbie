import {Module} from '@nestjs/common';
import {DataboardModule} from './databoard/databoard.module';
import {DatasourceModule} from './datasource/datasource.module';
import {DatatransModule} from './datatrans/datatrans.module';

@Module({
  imports: [DataboardModule, DatasourceModule, DatatransModule],
})
export class EnginedModule {}
