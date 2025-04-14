import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class AdditionalModifyRequestDto {
  @ApiProperty({
    type: String,
    description: 'SNS url(100자 이내)',
    example: 'url',
  })
  @IsOptional()
  @Length(1, 100)
  @IsString()
  SNS?: string = null;

  @ApiProperty({
    type: [String],
    description: '포트폴리오 이미지 url',
    example: ['url1', 'url2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioImages?: string[] = null;
}
