import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../../toolkits/prisma/prisma.module';
import {UserJwtService} from './jwt.service';

@Module({
  imports: [PrismaModule],
  providers: [UserJwtService],
  exports: [UserJwtService],
})
export class UserJwtModule {}
