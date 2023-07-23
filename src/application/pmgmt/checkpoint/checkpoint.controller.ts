import {Controller, Delete, Get, Patch, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ProjectCheckpointService} from './checkpoint.service';
import {Prisma, ProjectCheckpoint, ProjectCheckpointType} from '@prisma/client';

@ApiTags('[Application] Project Management / Project Checkpoint')
@ApiBearerAuth()
@Controller('project-checkpoints')
export class ProjectCheckpointController {
  constructor(private readonly checkpointService: ProjectCheckpointService) {}

  @Get('types')
  listCheckpoints() {
    return Object.values(ProjectCheckpointType);
  }

  @Get('states')
  listCheckpointStates() {
    return ['Todo', 'Processing', 'Done', '-'];
  }

  @Get(':checkpointId')
  @ApiParam({
    name: 'checkpointId',
    schema: {type: 'number'},
    example: '1',
  })
  async getCheckpoint(
    @Param('checkpointId') checkpointId: number
  ): Promise<ProjectCheckpoint | null> {
    return await this.checkpointService.findUniqueOrThrow({
      where: {id: checkpointId},
    });
  }

  @Patch(':checkpointId')
  @ApiParam({
    name: 'checkpointId',
    schema: {type: 'number'},
    example: '1',
  })
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
    return await this.checkpointService.update({
      where: {id: checkpointId},
      data: body,
    });
  }

  @Delete(':checkpointId')
  @ApiParam({
    name: 'checkpointId',
    schema: {type: 'number'},
    example: '1',
  })
  async deleteCheckpoint(
    @Param('checkpointId') checkpointId: number
  ): Promise<ProjectCheckpoint | null> {
    return await this.checkpointService.delete({
      where: {id: checkpointId},
    });
  }

  /* End */
}
