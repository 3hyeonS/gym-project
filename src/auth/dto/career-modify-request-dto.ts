import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CareerDto } from './career-dto';
import { AcademyDto } from './academy-dto';
import { QualificationDto } from './qualification-dto';

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
    type: [CareerDto],
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
  @Type(() => CareerDto)
  careers?: CareerDto[] = null;

  @ApiProperty({
    type: AcademyDto,
    description: '학력 정보',
    example: {
      level: '대학교(4년제)',
      status: '졸업',
      detail: '서울대학교 체육교육과',
    },
  })
  @IsOptional()
  @Type(() => AcademyDto)
  academy?: AcademyDto = null;

  @ApiProperty({
    type: [QualificationDto],
    description: '자격증 정보',
    example: [
      {
        certificate: '생활스포츠지도사',
        level: '2급',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  qualifications?: QualificationDto[] = null;

  @ApiProperty({
    type: [String],
    description: '수상 내역',
    example: ['2026 ABCD 피지크 2위'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  award?: string[] = null;
}
