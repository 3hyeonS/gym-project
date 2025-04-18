import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CareerRequestDto } from './career-request-dto';

export class CareerModifyRequestDto {
  @ApiProperty({
    type: Number,
    description: '신입/경력 여부  \n0: 신입  \n1: 경력',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1], { message: 'apply must be 0 or 1' })
  isNew: number;

  @ApiProperty({
    type: [CareerRequestDto],
    description: '경력 사항',
    example: [
      {
        where: '헬스짐 강남점',
        start: '2020-01-01',
        end: '2022-12-31',
      },
      {
        where: 'PT 전문센터 분당점',
        start: '2023-01-01',
        end: '2024-03-01',
      },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CareerRequestDto)
  careers?: CareerRequestDto[] = null;
}
