import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class WorkConditionModifyRequestDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    description: '시/도 및 시/군/구',
    example: {
      서울: ['강동구', '송파구'],
      경기: ['성남시 분당구', '고양시 덕양구'],
    },
  })
  @IsObject()
  @IsNotEmpty()
  location: Record<string, string[]>;

  @ApiProperty({
    type: [String],
    description: '근무 형태',
    example: ['정규직', '프리랜서'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workType?: string[] = null;

  @ApiProperty({
    type: [String],
    description: '근무 시간',
    example: ['오전~오후 풀타임', '자유 근무'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workTime?: string[] = null;
}
