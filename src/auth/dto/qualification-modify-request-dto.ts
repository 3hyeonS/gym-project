import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { QualificationRequestDto } from './qualification-request-dto';

export class QualificationModifyRequestDto {
  @ApiProperty({
    type: [QualificationRequestDto],
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
  @Type(() => QualificationRequestDto)
  qualifications?: QualificationRequestDto[] = null;
}
