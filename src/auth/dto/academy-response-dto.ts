import { ApiProperty } from '@nestjs/swagger';
import { AcademyEntity } from '../entity/academy.entity';

export class AcademyResponseDto {
  @ApiProperty({
    type: String,
    description: '학력 단계',
    example: '대학교(4년제)',
  })
  level: string;

  @ApiProperty({
    type: String,
    description: '상태',
    example: '졸업',
  })
  status: string;

  @ApiProperty({
    type: String,
    description: '학교명 및 전공 등 상세 내용',
    example: '서울대학교 체육교육과',
  })
  detail: string;

  constructor(academy: AcademyEntity) {
    this.level = academy.level;
    this.status = academy.status;
    this.detail = academy.detail;
  }
}
