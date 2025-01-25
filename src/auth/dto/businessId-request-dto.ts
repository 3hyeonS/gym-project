import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class BusinessIdRequestDto {
  @ApiProperty({
    type: String,
    description: '유효성 검사할 사업자 등록 번호',
    example: '000-00-00000',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{3}-\d{2}-\d{5}$/, {
    message: 'businessId format must be 000-00-00000',
  })
  businessId: string;
}
