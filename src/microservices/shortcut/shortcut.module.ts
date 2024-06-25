import {Module, Global} from '@nestjs/common';
import {ShortcutService} from './shortcut.service';

@Global()
@Module({
  providers: [ShortcutService],
  exports: [ShortcutService],
})
export class ShortcutModule {}
