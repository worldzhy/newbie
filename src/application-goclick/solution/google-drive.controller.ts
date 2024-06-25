import {Controller, Post} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {GoogleDriveService} from '@microservices/storage/google-drive/google-drive.service';

@ApiTags('Solution')
@ApiBearerAuth()
@Controller('solution')
export class SolutionGoogleDriveController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleDriveService: GoogleDriveService
  ) {}

  @Post('init-google-drive-example')
  @NoGuard()
  async initGoogleDriveExample() {
    // [step 1] Find root files.
    const rootFiles = await this.prisma.googleFile.findMany({
      where: {parentId: null},
      select: {id: true},
    });

    // [step 2] Delete all the files.
    for (let i = 0; i < rootFiles.length; i++) {
      await this.googleDriveService.deleteFileRecursively(rootFiles[i].id);
    }

    // [step 3] Create example files.
    const exampleFolder = await this.googleDriveService.createFolder({
      name: 'Example Folder',
    });
    await this.googleDriveService.createDocument({
      name: 'Example Document',
    });
    await this.googleDriveService.createSheet({
      name: 'Example Sheet',
    });
    await this.googleDriveService.createDocument({
      name: 'Example Document 2',
      parentId: exampleFolder.id,
    });
  }
}
