import {Module} from '@nestjs/common';
import {FileModule} from './file/file.module';
import {FolderModule} from './folder/folder.module';
import {FileManagementController} from './fmgmt.controller';

@Module({
  imports: [FileModule, FolderModule],
  controllers: [FileManagementController],
})
export class FileManagementModule {}
