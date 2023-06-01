import {Module} from '@nestjs/common';
import {FileService} from './file/file.service';
import {FolderService} from './folder/folder.service';

@Module({
  providers: [FileService, FolderService],
  exports: [FileService, FolderService],
})
export class FileManagementModule {}
