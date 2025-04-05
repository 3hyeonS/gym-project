import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { RecruitmentResponseDto } from './recruitment-response-dto';

export class GetMyRecruitmentsResponseDto {
  @ValidateNested()
  @ApiProperty({
    type: RecruitmentResponseDto,
    description: '채용 중 공고',
  })
  @Type(() => RecruitmentResponseDto)
  hiring: RecruitmentResponseDto | null;

  @ValidateNested()
  @ApiProperty({
    type: [RecruitmentResponseDto],
    description: '만료된 공고',
  })
  @Type(() => RecruitmentResponseDto)
  expired: RecruitmentResponseDto[];

  constructor(
    myRecruitment: RecruitmentResponseDto | null,
    myExpiredRecruitments: RecruitmentResponseDto[],
  ) {
    this.hiring = myRecruitment;
    this.expired = myExpiredRecruitments;
  }
}
