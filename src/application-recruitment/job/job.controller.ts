import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, Job, PermissionAction} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Recruitment / Job')
@ApiBearerAuth()
@Controller('recruitment-jobs')
export class JobController {
  constructor(private prisma: PrismaService) {}

  @Get('sites')
  listJobSites(): string[] {
    return [
      'Harley-Davidson Motor Co. - York',
      'Harley-Davidson Motor Co. - Tomahawk',
      'Harley-Davidson Motor Co. - Corporate',
      'Harley-Davidson Motor Co. - PTO Pilgrim Rd',
      'Harley-Davidson Motor Co. - HDFS Plano, TX',
      'Harley-Davidson Motor Co. - PDC - AZ',
      'Harley-Davidson Motor Co. - Museum',
      'Harley-Davidson Motor Co. - HDFS Chicago, IL',
      'Harley-Davidson Motor Co. - HDFS Reno, NV',
      'Harley-Davidson Motor Co. - AZ Proving Ground',
      'Harley-Davidson Motor Co. - HDDS Valley View, OH',
      'Harley-Davidson Motor Co. - Field',
      'Harley-Davidson Motor Co. - Menomonee Falls - Non-contract',
      'Harley-Davidson Motor Co. - Other',
    ];
  }

  @Get('codes')
  listJobCodes(): string[] {
    return [
      'Y-PT1 Prod Tech',
      'Y-PT2 Skilled Trades',
      'Y-PT2 Weld',
      'PTO PT Prod Tech',
      'PTO Maint Mech',
      'PTO Maint Electrician',
      'PTO Maint Mech Millwright',
      'PTO Tool Room',
      'PDC Technician',
      'TOM Production',
      'TOM Maintenance',
      'Other',
    ];
  }

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Job)
  @ApiBody({
    description: 'Create a user job.',
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
  async createJob(@Body() body: Prisma.JobUncheckedCreateInput): Promise<Job> {
    return await this.prisma.job.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Job)
  async getJobs(): Promise<Job[]> {
    return await this.prisma.job.findMany({});
  }

  @Get(':jobId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Job)
  async getJob(@Param('jobId') jobId: string): Promise<Job | null> {
    return await this.prisma.job.findUnique({where: {id: jobId}});
  }

  @Patch(':jobId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Job)
  @ApiBody({
    description: 'Update a specific user job.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          email: 'robert.smith@hd.com',
          phone: '131280122',
          firstName: 'Robert',
          middleName: 'William',
          lastName: 'Smith',
        },
      },
    },
  })
  async updateJob(
    @Param('jobId') jobId: string,
    @Body() body: Prisma.JobUpdateInput
  ): Promise<Job> {
    return await this.prisma.job.update({
      where: {id: jobId},
      data: body,
    });
  }

  @Delete(':jobId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.Job)
  async deleteUser(@Param('jobId') jobId: string): Promise<Job> {
    return await this.prisma.job.delete({
      where: {id: jobId},
    });
  }

  /* End */
}
