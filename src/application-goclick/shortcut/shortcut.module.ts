import {Module} from '@nestjs/common';
import {ShortcutController} from './shortcut.controller';

@Module({
  controllers: [ShortcutController],
})
export class AppShortcutModule {}
