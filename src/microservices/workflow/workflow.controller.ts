import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {Workflow, Prisma, PermissionAction} from '@prisma/client';
import {RequirePermission} from '../../applications/account/authorization/authorization.decorator';
import {WorkflowService} from './workflow.service';

@ApiTags('[Microservice] Workflow')
@ApiBearerAuth()
@Controller('workflows')
export class WorkflowController {
  private workflowService = new WorkflowService();

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.Workflow)
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          step: 'STEP1',
          state: 'Pending',
          nextStep: 'STEP2',
          nextRoleId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
        },
      },
    },
  })
  async createWorkflow(
    @Body() body: Prisma.WorkflowUncheckedCreateInput
  ): Promise<Workflow> {
    return await this.workflowService.create({
      data: body,
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Workflow)
  @ApiQuery({name: 'step', type: 'string'})
  async getWorkflows(@Query() query: {step?: string}): Promise<Workflow[]> {
    // [step 1] Construct where argument.
    let where: Prisma.WorkflowWhereInput | undefined;
    if (query.step) {
      where = {step: query.step};
    }

    // Get workflows.
    return await this.workflowService.findMany({where: where});
  }

  @Get(':workflowId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Workflow)
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'number'},
    description: 'The id of the workflow.',
    example: 11,
  })
  async getWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<Workflow | null> {
    return await this.workflowService.findUnique({
      where: {id: parseInt(workflowId)},
    });
  }

  @Patch(':workflowId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.Workflow)
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'number'},
    description: 'The id of the workflow.',
    example: 11,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          step: 'STEP1',
          state: 'Pending',
          nextStep: 'STEP2',
          nextUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
        },
      },
    },
  })
  async updateWorkflow(
    @Param('workflowId') workflowId: string,
    @Body()
    body: Prisma.WorkflowUpdateInput
  ): Promise<Workflow> {
    return await this.workflowService.update({
      where: {id: parseInt(workflowId)},
      data: body,
    });
  }

  @Delete(':workflowId')
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.Workflow)
  @ApiParam({
    name: 'workflowId',
    schema: {type: 'number'},
    example: 11,
  })
  async deleteWorkflow(
    @Param('workflowId') workflowId: string
  ): Promise<Workflow> {
    return await this.workflowService.delete({
      where: {id: parseInt(workflowId)},
    });
  }

  /* End */
}
