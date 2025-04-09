import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class IdRequestDto {
  @ApiProperty({
    type: Number,
    description: '채용 공고의 id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
