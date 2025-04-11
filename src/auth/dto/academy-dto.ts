import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcademyDto {
  @ApiProperty({
    type: String,
    description: '학력 단계',
    example: '대학교(4년제)',
  })
  @IsNotEmpty()
  @IsString()
  level: string;

  @ApiProperty({
    type: String,
    description: '상태',
    example: '졸업',
  })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({
    type: String,
    description: '학교명 및 전공 등 상세 내용',
    example: '서울대학교 체육교육과',
  })
  @IsNotEmpty()
  @IsString()
  detail: string;
}
