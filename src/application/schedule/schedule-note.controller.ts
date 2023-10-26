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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, EventContainerNote} from '@prisma/client';
import {EventContainerNoteService} from '@microservices/event-scheduling/event-container-note.service';

@ApiTags('Event Container Note')
@ApiBearerAuth()
@Controller('event-container-notes')
export class EventContainerNoteController {
  constructor(
    private readonly eventContainerNoteService: EventContainerNoteService
  ) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          description: 'a note',
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          containerId: 1,
        },
      },
    },
  })
  async createEventContainerNote(
    @Body()
    body: Prisma.EventContainerNoteUncheckedCreateInput
  ): Promise<EventContainerNote> {
    return await this.eventContainerNoteService.create({
      data: body,
    });
  }

  @Get('')
  async getEventContainerNotes(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('containerId') containerId: number
  ) {
    return await this.eventContainerNoteService.findManyInManyPages(
      {page, pageSize},
      {where: {containerId}, orderBy: {updatedAt: 'desc'}}
    );
  }

  @Patch(':noteId')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          description: 'a note',
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          containerId: 1,
        },
      },
    },
  })
  async updateEventContainerNote(
    @Param('noteId') noteId: number,
    @Body()
    body: Prisma.EventContainerNoteUncheckedUpdateInput
  ): Promise<EventContainerNote> {
    return await this.eventContainerNoteService.update({
      where: {id: noteId},
      data: body,
    });
  }

  @Delete(':noteId')
  async deleteEventContainerNote(
    @Param('noteId') noteId: number
  ): Promise<EventContainerNote> {
    return await this.eventContainerNoteService.delete({
      where: {id: noteId},
    });
  }

  /* End */
}
