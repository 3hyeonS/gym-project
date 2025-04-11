import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class AdditionalModifyRequestDto {
  @ApiProperty({
    type: String,
    description: '포트폴리오 url(100자 이내)',
    example: 'url',
  })
  @IsOptional()
  @Length(1, 100)
  @IsString()
  portfolio?: string = null;

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
