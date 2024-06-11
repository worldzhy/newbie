import {Module} from '@nestjs/common';
import {GoClickModule} from '@microservices/go-click/go-click.module';
import {GoClickController} from './go-click.controller';

@Module({
  imports: [GoClickModule],
  controllers: [GoClickController],
})
export class App0GoClickModule {}
