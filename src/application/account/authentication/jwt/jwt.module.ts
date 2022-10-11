import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: '1h'},
    }),
  ],
  providers: [JwtStrategy],
})
export class AuthJwtModule {}
