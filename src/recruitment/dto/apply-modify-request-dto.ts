import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class ApplyModifyRequestDto {
  @ApiProperty({
    type: Number,
    description:
      '지원 방법  \n0: 앱 내 지원  \n1: 앱 내 지원 & 이메일+문자 지원',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1], { message: 'apply must be 0 or 1' })
  apply: number;
}
