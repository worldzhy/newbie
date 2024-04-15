import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiParam, ApiTags} from '@nestjs/swagger';
import {
  Document,
  DocumentContent,
  DocumentStatus,
  DocumentTypes,
  File,
  PermissionAction,
  Prisma,
} from '@prisma/client';
import {PDFEngine} from 'chromiumly';
import type {Response} from 'express';
import {createReadStream} from 'fs';
import {DocumentService} from './document.service';
const Docxtemplater = require('docxtemplater');
import PizZip = require('pizzip');
import path = require('path');
import fs = require('fs');
import {replace} from 'lodash';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {S3DriveService} from '@microservices/drive/s3/s3-drive.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {AccountService} from '@microservices/account/account.service';
import {Request} from 'express';

@ApiTags('[Application] Recruitment / Document')
@ApiBearerAuth()
@Controller('recruitment-document')
export class DocumentController {
  constructor(
    private prisma: PrismaService,
    private accountService: AccountService,
    private documentService: DocumentService,
    private s3: S3DriveService
  ) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Document)
  @ApiBody({
    description: 'Create a user document.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          position: 'Designer',
          description: 'Designing the UX of mobile applications',
        },
      },
    },
  })
  async createDocument(
    @Req() request: Request,
    @Body()
    body: Prisma.DocumentUncheckedCreateInput & {
      content: Prisma.DocumentContentCreateInput;
    }
  ): Promise<Document> {
    const user = await this.accountService.me(request);

    const documentCreateInput: Prisma.DocumentUncheckedCreateInput = {
      approvalDate: body.approvalDate,
      approvalName: body.approvalName,
      title: body.title,
      validEndsAt: body.validEndsAt,
      validStartsAt: body.validStartsAt,
      documentTemplateId: body.documentTemplateId,
      fileId: body.fileId,
      templateType: body.templateType,
      organizationId: user.profiles[0].organizationId,
      sourceDocumentId: body.sourceDocumentId,
    };

    const jobCode = body.content
      .jobCode as Prisma.DocumentContentJobCodeCreateManyDocumentContentInput[];

    const essentialFunction = body.content
      .essentialFunction as Prisma.DocumentContentEssentialFunctionCreateManyDocumentContentInput[];

    const contentCreateInput: Prisma.DocumentContentUncheckedCreateWithoutDocumentInput =
      {
        company: body.content.company,
        deptArea: body.content.deptArea,
        location: body.content.location,
        familyDept: body.content.familyDept,
        jobAddress: body.content.jobAddress,
        jobAnalyst: body.content.jobAnalyst,
        jobSummary: body.content.jobSummary,
        patientFacing: body.content.patientFacing,
        dateOfAnalysis: body.content.dateOfAnalysis,
        jobCode: {
          createMany: {
            data: jobCode.map(item => ({
              title: item.title,
              content: item.content,
            })),
          },
        },
        essentialFunction: {
          createMany: {
            data: essentialFunction.map(item => ({
              title: item.title,
              content: item.content,
            })),
          },
        },
      };

    const doc = await this.documentService.create({
      data: {
        ...documentCreateInput,
        content: {
          create: contentCreateInput,
        },
      },
      include: {
        file: true,
        content: {
          include: {
            jobCode: true,
            essentialFunction: true,
          },
        },
      },
    });
    await this.documentService.createHistory({
      data: {
        documentId: doc.id,
        newContent: doc as unknown as string,
        processedByUserIds: [user.id],
      },
    });
    return doc;
  }

  @Get('/count')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Document)
  async getDocumentsCount(
    @Req() request: Request,
    @Query()
    query: {
      title?: string;
      status?: string;
      type?: string;
      page?: string;
      pageSize?: string;
      content?: string;
    }
  ): Promise<number> {
    let where: Prisma.DocumentWhereInput = {};
    const whereConditions: object[] = [];

    const user = await this.accountService.me(request);

    if (user.profiles[0].organizationId) {
      whereConditions.push({
        organizationId: user.profiles[0].organizationId,
      });
    }

    if (query.title) {
      if (query.title && query.title.trim().length > 0) {
        whereConditions.push({
          title: {
            contains: query.title,
            mode: 'insensitive',
          },
        });
      }
    }

    if (query.type) {
      whereConditions.push({
        type: query.type,
      });
    }

    if (query.status) {
      whereConditions.push({
        status: query.status,
      });
    }

    if (query.content) {
      const content: {
        patientFacing?: string;
        location?: string;
        jobCode?: string;
        essentialFunction?: string;
      } = JSON.parse(query.content);
      if (content.patientFacing) {
        whereConditions.push({
          content: {
            patientFacing: content.patientFacing,
          },
        });
      }
      if (content.essentialFunction) {
        whereConditions.push({
          content: {
            essentialFunction: {
              some: {
                content: {
                  contains: content.essentialFunction,
                  mode: 'insensitive',
                },
              },
            },
          },
        });
      }
      if (content.jobCode) {
        whereConditions.push({
          content: {
            jobCode: {
              some: {
                content: {
                  contains: content.jobCode,
                  mode: 'insensitive',
                },
              },
            },
          },
        });
      }
      if (content.location) {
        whereConditions.push({
          content: {
            location: {
              search: content.location,
            },
          },
        });
      }
    }

    if (whereConditions.length > 0) {
      where = {AND: whereConditions};
    }

    const docs = await this.documentService.count({
      where,
    });
    return docs;
  }

  @Get('')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Document)
  async getDocuments(
    @Req() request: Request,
    @Query()
    query: {
      title?: string;
      status?: Prisma.EnumDocumentStatusFilter | DocumentStatus;
      type?: Prisma.EnumDocumentTypesFilter | DocumentTypes;
      page?: string;
      pageSize?: string;
      content?: string;
    }
  ): Promise<Document[]> {
    let where: Prisma.DocumentWhereInput = {};
    const whereConditions: Prisma.DocumentWhereInput[] = [];

    const user = await this.accountService.me(request);

    if (user.profiles[0].organizationId) {
      whereConditions.push({
        organizationId: user.profiles[0].organizationId,
      });
    }

    if (query.title) {
      if (query.title && query.title.trim().length > 0) {
        whereConditions.push({
          title: {
            contains: query.title,
            mode: 'insensitive',
          },
        });
      }
    }

    if (query.type) {
      whereConditions.push({
        type: query.type,
      });
    }

    if (query.status) {
      whereConditions.push({
        status: query.status,
      });
    }

    if (query.content) {
      const content: {
        patientFacing?: string;
        location?: string;
        jobCode?: string;
        essentialFunction?: string;
      } = JSON.parse(query.content);
      if (content.patientFacing) {
        whereConditions.push({
          content: {
            patientFacing: content.patientFacing,
          },
        });
      }
      if (content.essentialFunction) {
        whereConditions.push({
          content: {
            essentialFunction: {
              some: {
                content: {
                  contains: content.essentialFunction,
                  mode: 'insensitive',
                },
              },
            },
          },
        });
      }
      if (content.jobCode) {
        whereConditions.push({
          content: {
            jobCode: {
              some: {
                content: {
                  contains: content.jobCode,
                  mode: 'insensitive',
                },
              },
            },
          },
        });
      }
      if (content.location) {
        whereConditions.push({
          content: {
            location: {
              contains: content.location,
              mode: 'insensitive',
            },
          },
        });
      }
    }

    if (whereConditions.length > 0) {
      where = {AND: whereConditions};
    }

    let take: number, skip: number;
    if (query.page && query.pageSize) {
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      if (page > 0 && pageSize > 0) {
        take = pageSize;
        skip = pageSize * (page - 1);
      } else {
        throw new BadRequestException(
          'The page and pageSize must be larger than 0.'
        );
      }
    } else {
      take = 10;
      skip = 0;
    }

    const docs = await this.documentService.findMany({
      where,
      skip,
      take,
      include: {
        documentTemplate: true,
        file: true,
        content: {
          include: {
            jobCode: true,
            essentialFunction: true,
          },
        },
        history: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    for (let i = 0; i < docs.length; i++) {
      const docTemp = docs[i]['documentTemplate'];
      if (docTemp) {
        docTemp['path'] = (await this.prisma.file.findUnique({
          where: {
            id: docTemp.path,
          },
        })) as unknown as string;
      }
      const doc = docs[i];
      for (let j = 0; j < doc['history'].length; j++) {
        const history = doc['history'][j];
        history['processedByUser'] = [];
        const user = await this.prisma.user.findMany({
          where: {id: {in: history.processedByUserIds as string[]}},
          select: {email: true},
        });
        if (user.length) {
          history['processedByUser'] = user.map(u => u.email).join(', ');
        }
      }
    }
    return docs;
  }

  @Get(':documentId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Document)
  @ApiParam({
    name: 'documentId',
    schema: {type: 'string'},
    description: 'The uuid of the document.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getDocument(
    @Param('documentId') documentId: string
  ): Promise<Document | null> {
    return await this.documentService.findUnique({
      where: {id: documentId},
      include: {
        file: true,
        content: {
          include: {
            jobCode: true,
            essentialFunction: true,
          },
        },
      },
    });
  }

  @Patch(':documentId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Document)
  @ApiParam({
    name: 'documentId',
    schema: {type: 'string'},
    description: 'The uuid of the document.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: 'Update a specific user document.',
    examples: {
      a: {
        summary: '1. Update',
      },
    },
  })
  async updateDocument(
    @Req() request: Request,
    @Param('documentId') documentId: string,
    @Body()
    body: Prisma.DocumentUncheckedUpdateInput & {
      content: Prisma.DocumentContentUncheckedUpdateInput;
    }
  ): Promise<Document> {
    const user = await this.accountService.me(request);
    const oldDoc = (await this.documentService.findUnique({
      where: {id: documentId},
      include: {
        file: true,
        content: {
          include: {
            jobCode: true,
            essentialFunction: true,
          },
        },
      },
    })) as Document & {content: DocumentContent};
    let doc: Document;
    if (oldDoc?.type === 'PUBLISHED') {
      const documentCreateInput: Prisma.DocumentUncheckedCreateInput = {
        approvalDate: oldDoc.approvalDate,
        approvalName: oldDoc.approvalName,
        title: oldDoc.title,
        validEndsAt: oldDoc.validEndsAt,
        validStartsAt: oldDoc.validStartsAt,
        documentTemplateId: oldDoc.documentTemplateId,
        fileId: oldDoc.fileId,
        templateType: oldDoc.templateType,
        organizationId: oldDoc.organizationId,
      };

      const jobCode = body.content
        .jobCode as Prisma.DocumentContentJobCodeCreateManyDocumentContentInput[];
      const essentialFunction = body.content
        .essentialFunction as Prisma.DocumentContentEssentialFunctionCreateManyDocumentContentInput[];

      const contentCreateInput: Prisma.DocumentContentUncheckedCreateWithoutDocumentInput =
        {
          company: oldDoc.content.company,
          deptArea: oldDoc.content.deptArea,
          location: oldDoc.content.location,
          familyDept: oldDoc.content.familyDept,
          jobAddress: oldDoc.content.jobAddress,
          jobAnalyst: oldDoc.content.jobAnalyst,
          jobSummary: oldDoc.content.jobSummary,
          patientFacing: oldDoc.content.patientFacing,
          dateOfAnalysis: oldDoc.content.dateOfAnalysis,
          jobCode: {
            createMany: {
              data: jobCode.map(item => ({
                title: item.title,
                content: item.content,
              })),
            },
          },
          essentialFunction: {
            createMany: {
              data: essentialFunction.map(item => ({
                title: item.title,
                content: item.content,
              })),
            },
          },
        };

      doc = await this.documentService.create({
        data: {
          ...documentCreateInput,
          content: {
            create: contentCreateInput,
          },
          sourceDocumentId: oldDoc.id,
          organizationId: oldDoc.organizationId,
        },
        include: {
          file: true,
          content: {
            include: {
              jobCode: true,
              essentialFunction: true,
            },
          },
        },
      });
    } else {
      const jobCode = body.content
        .jobCode as Prisma.DocumentContentJobCodeCreateManyDocumentContentInput[];
      const essentialFunction = body.content
        .essentialFunction as Prisma.DocumentContentEssentialFunctionCreateManyDocumentContentInput[];
      doc = await this.documentService.update({
        where: {id: documentId},
        data: {
          approvalDate: body.approvalDate,
          approvalName: body.approvalName,
          title: body.title,
          validEndsAt: body.validEndsAt,
          validStartsAt: body.validStartsAt,
          documentTemplateId: body.documentTemplateId,
          fileId: body.fileId,
          templateType: body.templateType,
          content: {
            update: {
              company: body.content.company,
              deptArea: body.content.deptArea,
              location: body.content.location,
              familyDept: body.content.familyDept,
              jobAddress: body.content.jobAddress,
              jobAnalyst: body.content.jobAnalyst,
              jobSummary: body.content.jobSummary,
              patientFacing: body.content.patientFacing,
              dateOfAnalysis: body.content.dateOfAnalysis,
              jobCode: {
                set: [],
                createMany: {
                  data: jobCode.map(item => ({
                    title: item.title,
                    content: item.content,
                  })),
                },
              },
              essentialFunction: {
                set: [],
                createMany: {
                  data: essentialFunction.map(item => ({
                    title: item.title,
                    content: item.content,
                  })),
                },
              },
            },
          },
        },
        include: {
          file: true,
          content: {
            include: {
              jobCode: true,
              essentialFunction: true,
            },
          },
        },
      });
    }

    await this.documentService.createHistory({
      data: {
        documentId: doc.id,
        newContent: doc as unknown as string,
        oldContent: oldDoc as unknown as string,
        processedByUserIds: [user.id],
      },
    });
    return doc;
  }

  @Patch(':documentHistoryId/resetCurrentVersion')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Document)
  @ApiParam({
    name: 'documentHistoryId',
    schema: {type: 'string'},
    description: 'The uuid of the document.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: 'Update a specific user document.',
    examples: {
      a: {
        summary: '1. Update',
      },
    },
  })
  async resetCurrentDocumentVersion(
    @Req() request: Request,
    @Param('documentHistoryId') documentHistoryId: string
  ): Promise<Document> {
    const user = await this.accountService.me(request);
    const history = await this.documentService.findHistory({
      where: {id: documentHistoryId},
    });
    const oldDoc = await this.documentService.findUnique({
      where: {id: history?.documentId},
      include: {
        file: true,
        content: {
          include: {
            jobCode: true,
            essentialFunction: true,
          },
        },
      },
    });
    let doc;
    if (oldDoc?.type === 'PUBLISHED') {
      doc = await this.createDocument(request, {
        ...(history?.newContent as any),
        organizationId: oldDoc.organizationId,
        sourceDocumentId: oldDoc.id,
      });
    } else {
      doc = await this.updateDocument(
        request,
        history?.documentId as string,
        history?.newContent as any
      );
      console.log('updateDocument: ');
    }

    await this.documentService.createHistory({
      data: {
        documentId: doc.id,
        newContent: doc as unknown as string,
        oldContent: oldDoc as unknown as string,
        processedByUserIds: [user.id],
      },
    });
    return doc;
  }

  @Patch('/:documentId/publish')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Document)
  @ApiParam({
    name: 'documentId',
    schema: {type: 'string'},
    description: 'The uuid of the document.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async publish(
    @Req() request: Request,
    @Param('documentId') documentId: string,
    @Body() body: Prisma.DocumentUpdateInput
  ): Promise<Document> {
    const user = await this.accountService.me(request);

    const oldDoc = await this.documentService.findUnique({
      where: {id: documentId},
      include: {
        file: true,
        content: {
          include: {
            jobCode: true,
            essentialFunction: true,
          },
        },
      },
    });

    const doc = await this.documentService.update({
      where: {id: documentId},
      data: {
        type: 'PUBLISHED',
      },
      include: {
        file: true,
        content: {
          include: {
            jobCode: true,
            essentialFunction: true,
          },
        },
      },
    });
    if (doc.sourceDocumentId) {
      await this.documentService.update({
        where: {id: doc.sourceDocumentId},
        data: {
          status: 'INACTIVE',
        },
        include: {
          file: true,
          content: {
            include: {
              jobCode: true,
              essentialFunction: true,
            },
          },
        },
      });
    }
    await this.documentService.createHistory({
      data: {
        documentId: doc.id,
        newContent: doc as unknown as string,
        oldContent: oldDoc as unknown as string,
        processedByUserIds: [user.id],
      },
    });
    return doc;
  }

  @Delete(':documentId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.Document)
  @ApiParam({
    name: 'documentId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteUser(@Param('documentId') documentId: string): Promise<Document> {
    return await this.documentService.delete({
      where: {id: documentId},
    });
  }

  @Get('download/:documentId')
  @ApiParam({
    name: 'documentId',
    schema: {type: 'string'},
    description: 'The uuid of the document.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async downloadFile(
    @Res({passthrough: true}) response: Response,
    @Param('documentId') documentId: string
  ) {
    const doc = (await this.documentService.findUnique({
      where: {id: documentId},
      include: {
        file: true,
        content: {
          include: {
            jobCode: true,
            essentialFunction: true,
          },
        },
      },
    })) as Document & {content: DocumentContent} & {file: File};

    if (doc && doc.fileId) {
      const output = await this.s3.getObject({
        Bucket: doc.file.s3Bucket,
        Key: doc.file.s3Key,
      });

      if (output.Body) {
        if (
          doc.file.mimeType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          const output = await this.s3.getObject({
            Bucket: doc.file.s3Bucket,
            Key: doc.file.s3Key,
          });

          if (output.Body) {
            const zip = new PizZip(
              (await output.Body?.transformToByteArray()) as Uint8Array
            );

            const docFile = new Docxtemplater(zip, {
              paragraphLoop: true,
              linebreaks: true,
            });

            docFile.render(doc.content);

            const buff = docFile.getZip().generate({
              type: 'uint8array',
              compression: 'DEFLATE',
              compressionOptions: {
                level: 6,
              },
            });

            const tmpPath = __dirname + '/../../../../tmp/';
            const docFileName = `${replace(doc.id, /-/g, '')}${replace(
              doc.fileId,
              /-/g,
              ''
            )}.doc`;
            const pdfFileName = `${replace(doc.id, /-/g, '')}${replace(
              doc.fileId,
              /-/g,
              ''
            )}.pdf`;
            const docFilePath = path.resolve(tmpPath, docFileName);
            const pdffilePath = path.resolve(tmpPath, pdfFileName);

            await fs.writeFileSync(docFilePath, buff);
            if (!(await fs.existsSync(tmpPath))) {
              await fs.mkdirSync(tmpPath);
            }

            response.set({
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename=' + pdfFileName,
            });

            const buffer = await PDFEngine.convert({
              files: [docFilePath],
            });

            await fs.writeFileSync(pdffilePath, buffer);

            const stream = createReadStream(pdffilePath);
            return new StreamableFile(stream);
          }
        } else {
          response.set({
            'Content-Type': doc.file.mimeType,
            'Content-Disposition':
              'attachment; filename=' + doc.file.originalName,
          });
          const output = await this.s3.getObject({
            Bucket: doc.file.s3Bucket,
            Key: doc.file.s3Key,
          });

          if (output.Body) {
            const stream = await output.Body.transformToByteArray();
            return new StreamableFile(stream);
          }
        }
      } else {
        throw new BadRequestException('The file is empty.');
      }
    }
  }

  /* End */
}
