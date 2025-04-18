import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { AcademyRequestDto } from './academy-request-dto';

export class AcademyModifyRequestDto {
  @ApiProperty({
    type: AcademyRequestDto,
    description: '학력 정보',
    example: {
      level: '대학교(4년제)',
      status: '졸업',
      detail: '서울대학교 체육교육과',
    },
  })
  @IsOptional()
  @Type(() => AcademyRequestDto)
  academy?: AcademyRequestDto = null;
}
