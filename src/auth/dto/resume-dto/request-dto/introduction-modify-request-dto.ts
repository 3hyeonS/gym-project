import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class IntroductionModifyRequestDto {
  @ApiProperty({
    type: String,
    description: '자기소개(500자 이내)',
    example: '안녕하세요, 홍길동입니다.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  introduction?: string = null;
}
