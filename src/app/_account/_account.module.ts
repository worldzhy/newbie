import {Module} from '@nestjs/common';
import {AccountService} from './_account.service';
import {AccountController} from './_account.controller';
import {AuthJwtModule} from '../_auth/_auth-jwt/_auth-jwt.module';
import {ValidatorModule} from '../../_validator/_validator.module';
import {UserModule} from '../_user/_user.module';

@Module({
  imports: [UserModule, AuthJwtModule, ValidatorModule],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
