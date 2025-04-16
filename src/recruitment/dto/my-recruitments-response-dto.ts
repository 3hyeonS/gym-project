import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { RecruitmentResponseDto } from './recruitment-response-dto';

export class MyRecruitmentsResponseDto {
  @ValidateNested()
  @ApiProperty({
    type: RecruitmentResponseDto,
    description: '채용 중 공고',
  })
  @Type(() => RecruitmentResponseDto)
  hiring: RecruitmentResponseDto | null;

  @ApiProperty({
    type: [Number],
    description: '지원자 수',
    example: 1,
  })
  hiringApply: number;

  @ValidateNested()
  @ApiProperty({
    type: [RecruitmentResponseDto],
    description: '만료된 공고',
  })
  @Type(() => RecruitmentResponseDto)
  expired: RecruitmentResponseDto[];

  @ApiProperty({
    type: [Number],
    description: '지원자 수(배열)',
    example: [2],
  })
  expiredApplies: number[];

  constructor(
    myRecruitment: RecruitmentResponseDto | null,
    hiringApply: number,
    myExpiredRecruitments: RecruitmentResponseDto[],
    expiredApply: number[],
  ) {
    this.hiring = myRecruitment;
    this.hiringApply = hiringApply;
    this.expired = myExpiredRecruitments;
    this.expiredApplies = expiredApply;
  }
}
