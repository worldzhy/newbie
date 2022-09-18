import {Controller, Get, Patch, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {CheckpointService} from './checkpoint.service';
import {
  Prisma,
  ProjectCheckpoint,
  ProjectCheckpointState,
  ProjectCheckpointType,
} from '@prisma/client';

@ApiTags('[Application] Project Management / Checkpoint')
@ApiBearerAuth()
@Controller('project-management')
export class CheckpointController {
  private checkpointService = new CheckpointService();

  @Get('checkpoints/types')
  async listCheckpointCheckpoints() {
    return Object.values(ProjectCheckpointType);
  }

  @Patch('checkpoints/:checkpointId')
  @ApiParam({
    name: 'checkpointId',
    schema: {type: 'number'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  @ApiBody({
    description: 'Update checkpoint state.',
    examples: {
      a: {
        summary: '1. Update state',
        value: {
          state: ProjectCheckpointState.PROCESSING,
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

  /* End */
}
