import {Global, Module} from '@nestjs/common';
import {BasePrismaService, AlphaPrismaService} from './alpha.prisma.service';

const PRISMA_INJECTION_TOKEN = 'AlphaPrismaService';

// Reference - https://github.com/prisma/prisma/issues/18628#issuecomment-1571733790
@Global()
@Module({
  providers: [
    {
      provide: PRISMA_INJECTION_TOKEN,
      useFactory(): AlphaPrismaService {
        return new BasePrismaService().withExtensions();
      },
    },
  ],
  exports: [PRISMA_INJECTION_TOKEN],
})
export class AlphaPrismaModule {}
