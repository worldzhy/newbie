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
  Query,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {Express} from 'express';
import {FileService} from '../../../../microservices/fmgmt/file/file.service';
import {getFileManagementConfig} from '../../../../microservices/fmgmt/fmgmt.config';
import {S3Service} from '../../../../toolkits/aws/s3.service';
import {generateRandomLetters} from '../../../../toolkits/utilities/common.util';
import {Public} from '../../../account/authentication/public/public.decorator';
import {TcWorkflowService} from '../workflow.service';
import {FolderService} from '../../../../microservices/fmgmt/folder/folder.service';
import {TokenService} from '../../../../toolkits/token/token.service';
import {PdfService} from '../../../../toolkits/pdf/pdf.service';
import {PDFPageDrawTextOptions} from 'pdf-lib';

const CertificateTemplatePath = './files/certificate_template.pdf';

@ApiTags('[Application] Tc Request / Workflow / File')
@ApiBearerAuth()
@Controller('workflow-files')
export class TcWorkflowFileController {
  private tokenService = new TokenService();
  private fileService = new FileService();
  private s3Service = new S3Service();
  private tcWorkflowService = new TcWorkflowService();
  private folderService = new FolderService();
  private pdfService = new PdfService();

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
    const s3Key = folder.name + '/' + filename;
    const output = await this.s3Service.putObject({
      Bucket: bucket,
      Key: s3Key,
      Body: file.buffer,
    });

    // [step 3] Create a record.
    return await this.fileService.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        s3Bucket: bucket,
        s3Key: s3Key,
        s3Response: output as object,
        folderId: workflow.folderId,
      },
    });
  }

  @Get('get-certificate')
  @ApiQuery({name: 'workflowId', type: 'string'})
  async generateCertificate(
    @Query()
    query: {
      workflowId: string;
    }
  ) {
    // [step 1] Get workflow.
    const workflow = await this.tcWorkflowService.findUniqueOrThrow({
      where: {id: query.workflowId},
    });

    // [step 2] Generate certificate file
    const texts: {text: string; options: PDFPageDrawTextOptions}[] = [];
    if (workflow.dateOfBirth) {
      texts.push({
        text: workflow.dateOfBirth.toString(),
        options: {x: 50, y: 170, size: 10},
      });
    }
    if (workflow.placeOfBirth) {
      texts.push({
        text: workflow.placeOfBirth,
        options: {x: 50, y: 170, size: 10},
      });
    }
    if (workflow.passportNumber) {
      texts.push({
        text: workflow.passportNumber,
        options: {x: 50, y: 170, size: 10},
      });
    }
    if (workflow.dateOfIssue) {
      texts.push({
        text: workflow.dateOfIssue.toString(),
        options: {x: 50, y: 170, size: 10},
      });
    }
    if (workflow.dateOfExpiry) {
      texts.push({
        text: workflow.dateOfExpiry.toString(),
        options: {x: 50, y: 170, size: 10},
      });
    }
    if (workflow.countryOfIssue) {
      texts.push({
        text: workflow.countryOfIssue,
        options: {x: 50, y: 170, size: 10},
      });
    }
    if (workflow.statusCardNumber) {
      texts.push({
        text: workflow.statusCardNumber,
        options: {x: 50, y: 170, size: 10},
      });
    }
    if (workflow.dateOfStatusCardIssue) {
      texts.push({
        text: workflow.dateOfStatusCardIssue.toString(),
        options: {x: 50, y: 170, size: 10},
      });
    }

    const newPdf = await this.pdfService.drawTextOnPage({
      pdfPath: CertificateTemplatePath,
      pdfPage: 2,
      texts: [],
    });

    // [step 3] Upload certificate to s3.
    const folder = await this.folderService.findUniqueOrThrow({
      where: {id: workflow.folderId},
    });

    const filename = workflow.firstName + '_certificate.pdf';
    const bucket = getFileManagementConfig().s3_bucket!;
    const s3Key = folder.name + '/' + filename;
    const output = await this.s3Service.putObject({
      Bucket: bucket,
      Key: s3Key,
      Body: newPdf,
    });

    // [step 4] Create a record.
    const file = await this.fileService.create({
      data: {
        originalName: filename,
        mimeType: 'pdf',
        s3Bucket: bucket,
        s3Key: s3Key,
        s3Response: output as object,
        folderId: workflow.folderId,
      },
    });

    // [step 5] Update workflow.
    await this.tcWorkflowService.update({
      where: {id: query.workflowId},
      data: {fileIdForCertificate: file.id},
    });

    return {fileId: file.id};
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
        file.s3Key,
      token: token,
    };
  }

  /* End */
}
