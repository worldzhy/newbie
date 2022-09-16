import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './jwt.strategy';
import {PrismaModule} from '../../../../toolkits/prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: '60s'},
    }),
    PrismaModule,
  ],
  providers: [JwtStrategy],
})
export class AuthJwtModule {}
