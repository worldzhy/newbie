import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma, DocumentTemplate, PermissionAction} from '@prisma/client';

import {PrismaService} from '@toolkit/prisma/prisma.service';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {AccountService} from '@microservices/account/account.service';
import {Request} from 'express';

@ApiTags('[Application] Recruitment / Document Template')
@ApiBearerAuth()
@Controller('recruitment-document-template')
export class DocumentTemplateController {
  constructor(
    private prisma: PrismaService,
    private accountService: AccountService
  ) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.DocumentTemplate)
  @ApiBody({
    description: 'Create a user documentTemp.',
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
  async createDocumentTemplate(
    @Req() request: Request,
    @Body() body: Prisma.DocumentTemplateCreateInput
  ): Promise<DocumentTemplate> {
    const user = await this.accountService.me(request);
    const schemaJson = [
      {
        columns: [
          {
            title: 'Company',
            width: 'md',
            colProps: {md: 14, xs: 24},
            dataIndex: ['content', 'company'],
            formItemProps: {
              rules: [{message: 'please enter company', required: true}],
            },
          },
          {
            title: 'Address',
            width: 'md',
            colProps: {md: 14, xs: 24},
            dataIndex: ['content', 'jobAddress'],
            formItemProps: {
              rules: [{message: 'please enter address', required: true}],
            },
          },
          {
            title: 'Location',
            width: 'md',
            colProps: {md: 14, xs: 24},
            dataIndex: ['content', 'location'],
            formItemProps: {
              rules: [{message: 'please enter location', required: true}],
            },
          },
          {
            title: 'Family Dept.',
            width: 'md',
            colProps: {md: 14, xs: 24},
            dataIndex: ['content', 'familyDept'],
            formItemProps: {
              rules: [{message: 'please enter family dept.', required: true}],
            },
          },
          {
            title: 'Dept. Area',
            width: 'md',
            colProps: {md: 14, xs: 24},
            dataIndex: ['content', 'deptArea'],
            formItemProps: {
              rules: [{message: 'please enter dept. area', required: true}],
            },
          },
          {
            title: 'Patient Facing',
            width: 'md',
            colProps: {md: 14, xs: 24},
            dataIndex: ['content', 'patientFacing'],
            formItemProps: {
              rules: [{message: 'please enter patient facing', required: true}],
            },
          },
        ],
        valueType: 'group',
      },
      {
        columns: [
          {
            title: 'Job Analyst',
            width: 'md',
            colProps: {md: 14, xs: 24},
            dataIndex: ['content', 'jobAnalyst'],
            formItemProps: {
              rules: [{message: 'please enter job analyst', required: true}],
            },
          },
          {
            title: 'Date Of Analysis',
            width: 'md',
            colProps: {md: 14, xs: 24},
            dataIndex: ['content', 'dataOfAnalysis'],
            valueType: 'date',
            formItemProps: {
              rules: [
                {message: 'please enter date of analysis', required: true},
              ],
            },
          },
        ],
        valueType: 'group',
      },
      {
        title: 'Essential Functions',
        columns: [
          {
            columns: [
              {
                width: 'md',
                colProps: {sm: 12, xs: 24},
                initialValue: 'Essential Function',
                valueType: 'hidden',
                dataIndex: 'title',
                formItemProps: {rules: [{required: true}]},
              },
              {
                colProps: {sm: 12, xs: 24},
                dataIndex: 'content',
                formItemProps: {rules: [{required: true}]},
              },
            ],
            valueType: 'group',
          },
        ],
        colProps: {sm: 12, xs: 24},
        dataIndex: ['content', 'essentialFunction'],
        valueType: 'formList',
      },
      {
        title: 'Job Summary',
        colProps: {md: 14, xs: 24},
        dataIndex: ['content', 'jobSummary'],
        valueType: 'textarea',
        formItemProps: {
          rules: [{message: 'please enter job summary', required: true}],
        },
      },
      {
        title: 'Job Code',
        columns: [
          {
            columns: [
              {
                width: 'md',
                colProps: {sm: 12, xs: 24},
                valueType: 'hidden',
                initialValue: 'JOB_CODE:',
                dataIndex: 'title',
                formItemProps: {rules: [{required: true}]},
              },
              {
                colProps: {sm: 12, xs: 24},
                dataIndex: 'content',
                formItemProps: {rules: [{required: true}]},
              },
            ],
            valueType: 'group',
          },
        ],
        colProps: {sm: 12, xs: 24},
        dataIndex: ['content', 'jobCode'],
        valueType: 'formList',
      },
    ];
    return await this.prisma.documentTemplate.create({
      data: {
        schemaJson,
        organizationId: user.profiles[0].organizationId,
        name: body.name,
        path: body.path,
      },
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.DocumentTemplate)
  async getDocumentTemplates(
    @Req() request: Request,
    @Query() query: {page?: string; pageSize?: string}
  ): Promise<DocumentTemplate[]> {
    const where: Prisma.DocumentTemplateWhereInput = {};
    const user = await this.accountService.me(request);

    if (user.profiles[0].organizationId) {
      where.organizationId = user.profiles[0].organizationId;
    }

    // [step 2] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page && query.pageSize) {
      // Actually 'page' is string because it comes from URL param.
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

    const docTemps = await this.prisma.documentTemplate.findMany({
      where,
      take,
      skip,
    });
    for (let i = 0; i < docTemps.length; i++) {
      const docTemp = docTemps[i];
      docTemp['path'] = (await this.prisma.file.findUnique({
        where: {
          id: docTemp.path,
        },
      })) as unknown as string;
    }
    return docTemps;
  }

  @Get('/count')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.DocumentTemplate)
  async getDocumentTemplatesCount(@Req() request: Request): Promise<number> {
    const where: Prisma.DocumentTemplateWhereInput = {};
    const user = await this.accountService.me(request);
    if (user.profiles[0].organizationId) {
      where.organizationId = user.profiles[0].organizationId;
    }

    return await this.prisma.documentTemplate.count({where});
  }

  @Get(':documentTempId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.DocumentTemplate)
  @ApiParam({
    name: 'documentTempId',
    schema: {type: 'string'},
    description: 'The uuid of the documentTempTemp.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getDocumentTemplate(
    @Param('documentTempId') documentTempId: string
  ): Promise<DocumentTemplate | null> {
    return await this.prisma.documentTemplate.findUnique({
      where: {id: documentTempId},
    });
  }

  @Patch(':documentTempId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.DocumentTemplate)
  @ApiParam({
    name: 'documentTempId',
    schema: {type: 'string'},
    description: 'The uuid of the documentTemp.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: 'Update a specific user documentTemp.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          email: 'robert.smith@hd.com',
          phone: '131280122',
          givenName: 'Robert',
          middleName: 'William',
          familyName: 'Smith',
        },
      },
    },
  })
  async updateDocumentTemplate(
    @Param('documentTempId') documentTempId: string,
    @Body() body: Prisma.DocumentTemplateUpdateInput
  ): Promise<DocumentTemplate> {
    return await this.prisma.documentTemplate.update({
      where: {id: documentTempId},
      data: body,
    });
  }

  @Delete(':documentTempId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.DocumentTemplate)
  @ApiParam({
    name: 'documentTempId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteUser(
    @Param('documentTempId') documentTempId: string
  ): Promise<DocumentTemplate> {
    return await this.prisma.documentTemplate.delete({
      where: {id: documentTempId},
    });
  }

  /* End */
}
