import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class NumRequestDto {
  @ApiProperty({
    type: Number,
    description: '검색 개수',
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  num: number;
}
