import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class AwardModifyRequestDto {
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
