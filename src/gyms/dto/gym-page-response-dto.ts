import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { GymRegisterRequestDto } from './gym-registration-dto';
import { GymResponseDto } from './gym-response-dto';

export class GymPageResponseDto {
  @ValidateNested()
  @ApiProperty({
    type: [GymResponseDto],
    description: '공고 리스트',
  })
  @Type(() => GymRegisterRequestDto)
  gymList: GymResponseDto[];

  @ApiProperty({
    type: Number,
    description: '전체 공고 수',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  totalGyms: number;

  @ApiProperty({
    type: Number,
    description: '총 페이지 수',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  totalPages: number;

  @ApiProperty({
    type: Number,
    description: '현재 페이지',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  page: number;
}
