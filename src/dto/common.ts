import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsNotEmpty} from 'class-validator';
import {Type} from 'class-transformer';

export class CommonPaginationResDto {
  @ApiProperty({
    type: Number,
  })
  countOfCurrentPage: number;

  @ApiProperty({
    type: Number,
  })
  countOfTotal: number;

  @ApiProperty({
    type: Number,
  })
  page: number;

  @ApiProperty({
    type: Number,
  })
  pageSize: number;
}

export class CommonPaginationReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  pageSize: number;

  @ApiProperty({
    type: Number,
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
