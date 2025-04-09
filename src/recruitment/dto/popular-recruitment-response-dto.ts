import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { RecruitmentResponseDto } from './recruitment-response-dto';

export class RecruitmentListResponseDto {
  @ValidateNested()
  @ApiProperty({
    type: [RecruitmentResponseDto],
    description: '공고 리스트',
  })
  @Type(() => RecruitmentResponseDto)
  recruitments: RecruitmentResponseDto[];

  constructor(recruitments: RecruitmentResponseDto[]) {
    this.recruitments = recruitments;
  }
}
