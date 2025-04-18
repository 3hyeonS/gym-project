import { ApiProperty } from '@nestjs/swagger';
import { CareerEntity } from 'src/auth/entity/resume/career.entity';

export class CareerResponseDto {
  @ApiProperty({
    type: String,
    description: '근무지',
    example: '헬스짐 강남점',
  })
  where: string;

  @ApiProperty({
    type: Date,
    description: '시작일',
    example: '2020-01-01',
  })
  start: Date;

  @ApiProperty({
    type: Date,
    description: '종료일',
    example: '2022-12-31',
  })
  end: Date;

  constructor(career: CareerEntity) {
    this.where = career.where;
    this.start = career.start;
    this.end = career.end;
  }
}
