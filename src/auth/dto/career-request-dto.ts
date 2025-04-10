import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CareerRequestDto {
  @ApiProperty({
    type: String,
    description: '근무지',
    example: '헬스짐 강남점',
  })
  @IsNotEmpty()
  @IsString()
  where: string;

  @ApiProperty({
    type: Date,
    description: '시작일',
    example: '2020-01-01',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  start: Date;

  @ApiProperty({
    type: Date,
    description: '종료일',
    example: '2022-12-31',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  end: Date;
}
