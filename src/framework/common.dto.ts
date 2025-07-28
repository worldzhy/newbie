import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsNotEmpty} from 'class-validator';
import {Type} from 'class-transformer';

export class CommonPaginationResDto {
  @ApiProperty({
    type: Number,
    description: 'Number of items in the current page',
  })
  countOfCurrentPage: number;

  @ApiProperty({
    type: Number,
    description: 'Total number of items across all pages',
  })
  countOfTotal: number;

  @ApiProperty({
    type: Number,
    description: 'Page number, starts from 0',
  })
  page: number;

  @ApiProperty({
    type: Number,
    description: 'Page size, the number of items per page',
  })
  pageSize: number;
}

export class CommonPaginationReqDto {
  @ApiProperty({
    type: Number,
    description: 'Page size, the number of items per page',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  pageSize: number;

  @ApiProperty({
    type: Number,
    description: 'Page number, starts from 0',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page: number;
}
/** CUD: Create Update Delete */
export class CommonCUDResDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  id: number;
}
