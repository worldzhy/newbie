import {Module} from '@nestjs/common';

import {SessionController} from './sessions.controller';
import {SessionsService} from './sessions.service';

@Module({
  controllers: [SessionController],
  providers: [SessionsService],
})
export class SessionsModule {}
