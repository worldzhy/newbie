import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
  Get,
  Param,
  Body,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiBearerAuth, ApiBody, ApiParam, ApiTags} from '@nestjs/swagger';
import {Express} from 'express';
import {FileService} from '../../../../microservices/fmgmt/file/file.service';
import {getFileManagementConfig} from '../../../../microservices/fmgmt/fmgmt.config';
import {S3Service} from '../../../../toolkits/aws/s3.service';
import {generateRandomLetters} from '../../../../toolkits/utilities/common.util';
import {Public} from '../../../../applications/account/authentication/public/public.decorator';
import {TcWorkflowService} from '../workflow.service';
import {FolderService} from '../../../../microservices/fmgmt/folder/folder.service';
import {TokenService} from '../../../../toolkits/token/token.service';

@ApiTags('[Application] Tc Request / Workflow / File')
@ApiBearerAuth()
@Controller('workflow-files')
export class TcWorkflowFileController {
  private tokenService = new TokenService();
  private fileService = new FileService();
  private s3Service = new S3Service();
  private tcWorkflowService = new TcWorkflowService();
  private folderService = new FolderService();

  @Public()
  @Post('upload-file')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: 'Upload file',
        value: {workflowId: 'd8141ece-f242-4288-a60a-8675538549cd'},
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() body: {workflowId: string},
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'pdf|doc|png|jpg|jpeg',
        })
        .build()
    )
    file: Express.Multer.File
  ) {
    // [step 1] Get workflow.
    const workflow = await this.tcWorkflowService.findUniqueOrThrow({
      where: {id: body.workflowId},
    });

    // [step 2] Get workflow folder.
    const folder = await this.folderService.findUniqueOrThrow({
      where: {id: workflow.folderId},
    });

    // [step 3] Generate file name and put file to AWS S3.
    const filename = Date.now() + generateRandomLetters(4);
    const bucket = getFileManagementConfig().s3_bucket!;
    const output = await this.s3Service.putObject({
      Bucket: bucket,
      Key: folder.name + '/' + filename,
      Body: file.buffer,
    });

    // [step 3] Create a record.
    return await this.fileService.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        s3Bucket: bucket,
        s3Key: filename,
        s3Response: output as object,
        folderId: workflow.folderId,
      },
    });
  }

  @Get(':fileId/by-officer')
  @ApiParam({
    name: 'fileId',
    schema: {type: 'string'},
    description: 'The uuid of the file.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getFileUrl(
    @Request() request: Request,
    @Param('fileId') fileId: string
  ) {
    // [step 1] Get the file information.
    const file = await this.fileService.findUniqueOrThrow({
      where: {id: fileId},
      include: {folder: true},
    });

    const token = this.tokenService.getTokenFromHttpRequest(request);

    return {
      ...file,
      url:
        'https://' +
        getFileManagementConfig().cloudfront_domain +
        '/' +
        file['folder'].name +
        '/' +
        file.originalName,
      token: token,
    };
  }

  /* End */
}
