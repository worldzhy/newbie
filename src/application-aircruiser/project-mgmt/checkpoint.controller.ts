import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, ProjectCheckpoint, ProjectCheckpointType} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Project Checkpoint')
@ApiBearerAuth()
@Controller('project-checkpoints')
export class ProjectCheckpointController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('types')
  listCheckpoints() {
    return Object.values(ProjectCheckpointType);
  }

  @Get('states')
  listCheckpointStates() {
    return ['Todo', 'Processing', 'Done', '-'];
  }

  @Get('')
  async getCheckpoints(@Query('projectId') projectId: string) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.ProjectCheckpoint,
      findManyArgs: {where: {projectId}},
    });
  }

  @Get(':checkpointId')
  async getCheckpoint(
    @Param('checkpointId') checkpointId: number
  ): Promise<ProjectCheckpoint | null> {
    return await this.prisma.projectCheckpoint.findUniqueOrThrow({
      where: {id: checkpointId},
    });
  }

  @Patch(':checkpointId')
  @ApiBody({
    description: 'Update checkpoint state.',
    examples: {
      a: {
        summary: '1. Update state',
        value: {
          state: 'Processing',
        },
      },
    },
  })
  async updateCheckpoint(
    @Param('checkpointId') checkpointId: number,
    @Body() body: Prisma.ProjectCheckpointUpdateInput
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.update({
      where: {id: checkpointId},
      data: body,
    });
  }

  @Delete(':checkpointId')
  async deleteCheckpoint(
    @Param('checkpointId') checkpointId: number
  ): Promise<ProjectCheckpoint | null> {
    return await this.prisma.projectCheckpoint.delete({
      where: {id: checkpointId},
    });
  }

  /* End */
}
