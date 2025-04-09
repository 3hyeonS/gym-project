import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class IdIsHiringRequestDto {
  @ApiProperty({
    type: Number,
    description: '채용 공고의 id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    type: Number,
    description:
      '채용 중 여부(내 공고 1개 불러오기에서만 입력)  \n0: 채용 중  \n1: 만료',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  isHiring: number;
}
