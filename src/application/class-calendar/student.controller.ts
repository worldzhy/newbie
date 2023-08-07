import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma, User} from '@prisma/client';
import {UserService} from '../../microservices/account/user/user.service';

@ApiTags('Class Calendar / Student')
@ApiBearerAuth()
@Controller('students')
export class StudentController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          phone: '13500001234',
        },
      },
    },
  })
  async createStudent(
    @Body() body: Prisma.UserUncheckedCreateInput
  ): Promise<User> {
    return await this.userService.create({
      data: body,
    });
  }

  

  @Get('')
  async getStudents(): Promise<User[]> {
    return await this.userService.findMany({});
  }

  @Get(':userId')
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The id of the event.',
    example: 1,
  })
  async getStudent(@Param('userId') userId: string): Promise<User> {
    return await this.userService.findUniqueOrThrow({
      where: {id: userId},
    });
  }

  @Patch(':userId')
  @ApiParam({
    name: 'userId',
    schema: {type: 'number'},
    description: 'The id of the event.',
    example: 1,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'Speaking Student',
          minutesInAdvanceToReserve: 120,
          minutesInAdvanceToCancel: 120,
        },
      },
    },
  })
  async updateStudent(
    @Param('userId') userId: string,
    @Body()
    body: Prisma.UserUpdateInput
  ): Promise<User> {
    return await this.userService.update({
      where: {id: userId},
      data: body,
    });
  }

  @Delete(':userId')
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    example: 1,
  })
  async deleteStudent(@Param('userId') userId: string): Promise<User> {
    return await this.userService.delete({
      where: {id: userId},
    });
  }

  /* End */
}
