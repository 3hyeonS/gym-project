import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class BusinessIdRequestDto {
  @ApiProperty({
    type: String,
    description: '유효성 검사할 사업자 등록 번호',
    example: '000-00-00000',
  })
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\d{3}-\d{2}-\d{5}$/, {
    message: '사업자 등록 번호 형식에 어긋납니다.',
  })
  businessId: string;
}
