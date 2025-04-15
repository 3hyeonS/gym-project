import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { AcademyDto } from './academy-dto';

export class AcademyModifyRequestDto {
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
}
