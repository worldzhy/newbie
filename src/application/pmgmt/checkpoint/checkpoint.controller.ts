import {Controller, Get, Param, Body, Patch} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {CheckpointService} from './checkpoint.service';
import {
  ProjectCheckpoint,
  ProjectCheckpointState,
  ProjectCheckpointType,
} from '@prisma/client';

@ApiTags('[Application] Project Management / Checkpoint')
@ApiBearerAuth()
@Controller('project-management')
export class CheckpointController {
  private checkpointService = new CheckpointService();

  @Get('/checkpoints/types')
  async listCheckpointCheckpoints() {
    return Object.values(ProjectCheckpointType);
  }

  /**
   * Get checkpoints
   *
   * @param {string} projectId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof CheckpointController
   */
  @Get('/checkpoints/projects/:projectId')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the checkpoint.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getCheckpoints(
    @Param('projectId') projectId: string
  ): Promise<ProjectCheckpoint[]> {
    return await this.checkpointService.findMany({
      where: {projectId: projectId},
    });
  }

  /**
   * Update checkpoint
   *
   * @param {int} checkpointId
   * @param {{cfTemplateS3: string}} body
   * @returns
   * @memberof CheckpointController
   */
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
    @Body() body: {state: ProjectCheckpointState}
  ) {
    // [step 1] Guard statement.
    const {state} = body;

    // [step 2] Update environment.
    const result = await this.checkpointService.update({
      where: {id: checkpointId},
      data: {state: state},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Checkpoint updated failed.'},
      };
    }
  }

  /* End */
}
