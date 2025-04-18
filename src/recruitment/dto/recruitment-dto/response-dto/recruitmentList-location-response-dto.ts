import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { RecruitmentResponseDto } from './recruitment-response-dto';

export class RecruitmentListLocationResponseDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    description: '시/도 및 시/군/구',
    example: {
      서울: ['강동구', '송파구'],
      경기: ['성남시 분당구', '고양시 덕양구'],
    },
  })
  location: Record<string, string[]>;

  @ValidateNested()
  @ApiProperty({
    type: [RecruitmentResponseDto],
    description: '공고 리스트',
  })
  @Type(() => RecruitmentResponseDto)
  recruitmentList: RecruitmentResponseDto[];

  constructor(
    location: Record<string, string[]>,
    recruitmentList: RecruitmentResponseDto[],
  ) {
    this.location = location;
    this.recruitmentList = recruitmentList;
  }
}
