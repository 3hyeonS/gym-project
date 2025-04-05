import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { RecruitmentResponseDto } from './recruitment-response-dto';

export class RecruitmentsPageResponseDto {
  @ValidateNested()
  @ApiProperty({
    type: [RecruitmentResponseDto],
    description: '공고 리스트',
  })
  @Type(() => RecruitmentResponseDto)
  gymList: RecruitmentResponseDto[];

  @ApiProperty({
    type: Number,
    description: '총 공고 수',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  totalRecruitments: number;

  @ApiProperty({
    type: Number,
    description: '총 페이지 수',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  totalPages: number;

  @ApiProperty({
    type: Number,
    description: '현재 페이지',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  page: number;
}
