import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  Prisma,
  DatatransMission,
  DatatransMissionState,
  TaskType,
  TaskState,
} from '@prisma/client';
import {DatatransMissionService} from './mission.service';
import {TaskService} from '../../../../microservices/task/task.service';

@ApiTags('[Application] EngineD / Datatrans Mission')
@ApiBearerAuth()
@Controller('datatrans-missions')
export class DatatransMissionController {
  private datatransMissionService = new DatatransMissionService();
  private taskService = new TaskService();

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          numberOfRecords: 6,
          numberOfBatches: 1,
          datatransPipelineId: '5842956f-7dce-4c60-928d-575450c96d19',
        },
      },
    },
  })
  async createDatatransMission(
    @Body() body: Prisma.DatatransMissionUncheckedCreateInput
  ): Promise<DatatransMission> {
    return await this.datatransMissionService.create({data: body});
  }

  @Get('')
  async getDatatransMissions(): Promise<DatatransMission[]> {
    return await this.datatransMissionService.findMany({});
  }

  @Get(':missionId')
  @ApiParam({
    name: 'missionId',
    schema: {type: 'string'},
    description: 'The uuid of the datatransMission.',
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async getDatatransMission(
    @Param('missionId') missionId: string
  ): Promise<DatatransMission | null> {
    return await this.datatransMissionService.findUnique({
      where: {id: missionId},
    });
  }

  @Patch(':missionId')
  @ApiParam({
    name: 'missionId',
    schema: {type: 'string'},
    description: 'The uuid of the datatrans mission.',
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async updateDatatransMission(
    @Param('missionId') missionId: string,
    @Body() body: Prisma.DatatransMissionUpdateInput
  ): Promise<DatatransMission> {
    return await this.datatransMissionService.update({
      where: {id: missionId},
      data: body,
    });
  }

  @Delete(':missionId')
  @ApiParam({
    name: 'missionId',
    schema: {type: 'string'},
    description: 'The uuid of the datatrans mission.',
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async deleteDatatransMission(
    @Param('missionId') missionId: string
  ): Promise<DatatransMission> {
    return await this.datatransMissionService.delete({
      where: {id: missionId},
    });
  }

  //* Start
  @Patch(':missionId/start')
  @ApiParam({
    name: 'missionId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async startDatatransMission(
    @Param('missionId') missionId: string
  ): Promise<DatatransMission> {
    // [step 1] Get mission.
    const mission = await this.datatransMissionService.findUnique({
      where: {id: missionId},
    });
    if (!mission) {
      throw new NotFoundException('Not found the mission.');
    }

    // [step 2] Send tasks.
    const numberOfRecordsPerBatch = Math.floor(
      mission.numberOfRecords / mission.numberOfBatches
    );
    const numberOfRecordsForLastBatch =
      mission.numberOfRecords % mission.numberOfBatches;
    for (let i = 0; i < mission.numberOfBatches; i++) {
      await this.taskService.sendTask({
        type: TaskType.DATATRANS_BATCH_PROCESSING,
        group: missionId,
        payload: {
          missionId: missionId,
          take: numberOfRecordsPerBatch,
          skip: numberOfRecordsPerBatch * i,
        },
      });
    }
    if (numberOfRecordsForLastBatch > 0) {
      await this.taskService.sendTask({
        type: TaskType.DATATRANS_BATCH_PROCESSING,
        group: missionId,
        payload: {
          missionId: missionId,
          take: numberOfRecordsForLastBatch,
          skip: mission.numberOfRecords - numberOfRecordsForLastBatch,
        },
      });
    }

    // [step 3] Update mission state.
    return await this.datatransMissionService.update({
      where: {id: missionId},
      data: {state: DatatransMissionState.STARTED},
    });
  }

  //* Stop
  @Patch(':missionId/stop')
  @ApiParam({
    name: 'missionId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async stopDatatransMission(
    @Param('missionId') missionId: string
  ): Promise<DatatransMission> {
    // [step 1] Update task state.
    await this.taskService.updateMany({
      where: {group: missionId},
      data: {state: TaskState.CANCELED},
    });

    // [step 2] Update mission state.
    return await this.datatransMissionService.update({
      where: {id: missionId},
      data: {state: DatatransMissionState.STOPPED},
    });
  }

  /* End */
}
