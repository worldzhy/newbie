import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {ValidatorAccountService} from './_validator-account.service';
import {ValidatorAwsService} from './_validator-aws.service';
import {ValidatorAppService} from './_validator-app.service';

@ApiTags('Validator')
@ApiBearerAuth()
@Controller()
export class ValidatorController {
  @Post('validator/password')
  @ApiBody({
    examples: {
      a: {
        summary: '1. Missing special symbol(s)',
        value: {
          password: 'Abc123456',
        },
      },
      b: {
        summary: '2. Missing uppercase letter(s)',
        value: {
          password: 'abc123456!',
        },
      },
      c: {
        summary: '3. Correct format',
        value: {
          password: 'Abc123456!',
        },
      },
    },
    description: "The request body should contain 'password' attribute.",
  })
  verifyPassword(@Body() body: {password: string}): boolean {
    return ValidatorAccountService.verifyPassword(body.password);
  }

  @Post('validator/username')
  @ApiBody({
    examples: {
      a: {
        summary: '1. Not long enough',
        value: {
          username: 'jack',
        },
      },
      c: {
        summary: '2. Valid username',
        value: {
          username: 'jack123',
        },
      },
    },
    description: "The request body should contain 'username' attribute.",
  })
  verifyUsername(@Body() body: {username: string}): boolean {
    return ValidatorAccountService.verifyUsername(body.username);
  }

  @Post('validator/email')
  @ApiBody({
    examples: {
      a: {
        summary: '1. Incorrect format',
        value: {
          email: 'email.example.com',
        },
      },
      b: {
        summary: '2. Correct format',
        value: {
          email: 'email@example.com',
        },
      },
    },
    description: "The request body should contain 'email' attribute.",
  })
  verifyEmail(@Body() body: {email: string}): boolean {
    return ValidatorAccountService.verifyEmail(body.email);
  }

  @Post('validator/phone')
  @ApiBody({
    examples: {
      a: {
        summary: '1. Invalid phone',
        value: {
          phone: '1234567899',
        },
      },
      b: {
        summary: '2. Valid phone',
        value: {
          phone: '13960068008',
        },
      },
    },
    description: "The request body should contain 'phone' attribute.",
  })
  verifyPhone(@Body() body: {phone: string}): boolean {
    return ValidatorAccountService.verifyPhone(body.phone);
  }

  @Post('validator/s3-bucketname')
  @ApiBody({
    examples: {
      a: {
        summary: '1. Uppercase letters prohibited',
        value: {
          bucketName: 'Example-bucket-name',
        },
      },
      b: {
        summary: '2. Correct format',
        value: {
          bucketName: 'example-bucket-name',
        },
      },
    },
    description: "The request body should contain 'bucketName' attribute.",
  })
  verifyS3Bucketname(@Body() body: {bucketName: string}) {
    return ValidatorAwsService.verifyS3Bucketname(body.bucketName);
  }

  @Post('validator/project-name')
  @ApiBody({
    examples: {
      a: {
        summary: '1. Allow space',
        value: {
          projectName: 'Project Name',
        },
      },
    },
    description: "The request body should contain 'projectName' attribute.",
  })
  verifyProjectName(@Body() body: {projectName: string}) {
    return ValidatorAppService.verifyProjectName(body.projectName);
  }
  /* End */
}
