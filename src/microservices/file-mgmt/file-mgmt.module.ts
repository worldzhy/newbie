import {Global, Module} from '@nestjs/common';
import {FileService} from './file/file.service';
import {FolderService} from './folder/folder.service';

@Global()
@Module({
  providers: [FileService, FolderService],
  exports: [FileService, FolderService],
})
export class FileManagementModule {}
