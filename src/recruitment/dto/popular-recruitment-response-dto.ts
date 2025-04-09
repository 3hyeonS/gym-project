import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { RecruitmentResponseDto } from './recruitment-response-dto';

export class PopularRecruitmentsResponseDto {
  @ValidateNested()
  @ApiProperty({
    type: [RecruitmentResponseDto],
    description: '인기 공고',
  })
  @Type(() => RecruitmentResponseDto)
  popularRecruitments: RecruitmentResponseDto[];

  constructor(popularRecruitments: RecruitmentResponseDto[]) {
    this.popularRecruitments = popularRecruitments;
  }
}
