import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {CustomLoggerService} from './_custom-logger.service';

@ApiTags('Logger')
@ApiBearerAuth()
@Controller()
export class CustomLoggerController {
  constructor(private logger: CustomLoggerService) {}

  @Post('logger/log')
  @ApiBody({
    description: "The 'message' is required in request body.",
    examples: {
      a: {
        summary: '1. Info level log',
        value: {
          message: 'an example log',
          level: 'info',
        },
      },
      b: {
        summary: '2. Warn level log',
        value: {
          message: 'an example log',
          level: 'warn',
        },
      },
    },
  })
  async log(
    @Body()
    body: {
      message: string;
      level: string;
    }
  ) {
    this.logger.log(body.message, body.level);
  }

  @Post('logger/warn')
  @ApiBody({
    description: "The 'message' is required in request body.",
    examples: {
      a: {
        summary: '1. Warn log',
        value: {
          message: 'an example log',
        },
      },
    },
  })
  async warn(
    @Body()
    body: {
      message: string;
    }
  ) {
    this.logger.warn(body.message);
  }

  @Post('logger/error')
  @ApiBody({
    description: "The 'message' is required in request body.",
    examples: {
      a: {
        summary: '1. Error log',
        value: {
          message: 'an example log',
        },
      },
    },
  })
  async error(
    @Body()
    body: {
      message: string;
    }
  ) {
    this.logger.error(body.message);
  }
  /* End */
}
