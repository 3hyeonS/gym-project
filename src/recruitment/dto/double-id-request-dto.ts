import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DoubleIdRequestDto {
  @ApiProperty({
    type: Number,
    description: '채용공고 id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  recruitmentId: number;

  @ApiProperty({
    type: Number,
    description: '이력서 id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  resumeId: number;
}
