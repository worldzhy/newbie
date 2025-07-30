import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsNotEmpty} from 'class-validator';
import {Type} from 'class-transformer';

class CommonPagination {
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

export class CommonListRequestDto {
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

export class CommonListResponseDto {
  @ApiProperty({
    type: CommonPagination,
    description: 'Pagination information for the response',
  })
  pagination: CommonPagination;

  @ApiProperty({
    type: Object,
    isArray: true,
    description: 'List of records in the current page',
  })
  records: any[];
}

/** CUD: Create Update Delete */
export class CommonCUDResDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  id: number;
}
