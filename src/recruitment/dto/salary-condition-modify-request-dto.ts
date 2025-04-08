import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SalaryCondtionModifyRequestDto {
  @ApiProperty({
    type: [String],
    description: '급여 조건',
    example: ['기본급', '수업료', '인센티브'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  salary: string[];

  @ApiProperty({
    type: [Number],
    description: '기본급 (단위: 원), [최저, 최대]',
    example: [800000, 1000000],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2) // 최소 크기 2
  @ArrayMaxSize(2) // 최대 크기 2
  @IsNumber({}, { each: true }) // 배열 내 각 요소가 숫자인지 확인
  basePay: number[] = null;

  @ApiProperty({
    type: [Number],
    description: '수업 단가 (단위: 원), [최저, 최대]',
    example: [50000, 65000],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2) // 최소 크기 2
  @ArrayMaxSize(2) // 최대 크기 2
  @IsNumber({}, { each: true }) // 배열 내 각 요소가 숫자인지 확인
  classPay: number[] = null;

  @ApiProperty({
    type: [Number],
    description: '수업료 분배(단위: %), [최저, 최대]',
    example: [40, 50],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2) // 최소 크기 2
  @ArrayMaxSize(2) // 최대 크기 2
  @IsNumber({}, { each: true }) // 배열 내 각 요소가 숫자인지 확인
  classFee: number[] = null;

  @ApiProperty({
    type: [Number],
    description: '월급 (단위: 원), [최저, 최대]',
    example: [2000000, 2500000],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2) // 최소 크기 2
  @ArrayMaxSize(2) // 최대 크기 2
  @IsNumber({}, { each: true }) // 배열 내 각 요소가 숫자인지 확인
  monthly: number[] = null;

  @ApiProperty({
    type: [Number],
    description: '시급 (단위: 원), [최저, 최대]',
    example: [20000, 30000],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2) // 최소 크기 2
  @ArrayMaxSize(2) // 최대 크기 2
  @IsNumber({}, { each: true }) // 배열 내 각 요소가 숫자인지 확인
  hourly: number[] = null;

  @ApiProperty({
    type: [String],
    description: '4대 보험, 퇴직금',
    example: ['4대 보험'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  welfare: string[];
}
