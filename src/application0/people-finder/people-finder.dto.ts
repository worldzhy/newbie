import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsArray, IsOptional} from 'class-validator';
import {PeopleFinderPlatforms} from '@microservices/people-finder/constants';
import {ContactSearchPeopleBase} from '@microservices/people-finder/people-finder.dto';

export class ContactSearchPeopleDto extends ContactSearchPeopleBase {
  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsString()
  @IsOptional()
  findPhone?: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsString()
  @IsOptional()
  findEmail?: boolean;
}
export class ContactSearchReqDto {
  @ApiProperty({
    type: String,
    enum: PeopleFinderPlatforms,
  })
  @IsArray()
  @IsString({each: true})
  platforms: PeopleFinderPlatforms[];

  @ApiProperty({
    type: ContactSearchPeopleDto,
    isArray: true,
  })
  @IsArray()
  peoples: ContactSearchPeopleDto[];
}

export class AddTaskContactSearchReqDto {
  @ApiProperty({
    type: ContactSearchPeopleDto,
    isArray: true,
  })
  @IsArray()
  peoples: ContactSearchPeopleDto[];

  @ApiProperty({
    type: String,
  })
  @IsString()
  taskId: string;
}

export class AddTaskContactSearchResDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  taskId: string;
}

export class GetTaskContactSearchReqDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  taskId: string;
}

export class GetTaskStatusResDto {
  @ApiProperty({
    type: Boolean,
  })
  completed: boolean;

  @ApiProperty({
    type: Number,
  })
  totalCompleted: number;

  @ApiProperty({
    type: Number,
  })
  total: number;
}
