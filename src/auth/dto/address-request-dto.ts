import { ApiProperty } from '@nestjs/swagger';

export class AddressRequestDto {
  @ApiProperty({
    type: String,
    description: '검색 주소',
    example: '송파구 올림픽로',
  })
  address: string;
}
