import { ApiProperty } from '@nestjs/swagger';

export class BusinessIdRequestDto {
  @ApiProperty({
    type: String,
    description: '유효성 검사할 사업자 등록 번호',
    example: '000-00-00000',
  })
  businessId: string;
}
