import { ApiProperty } from '@nestjs/swagger';

export class addressResponseDto {
  @ApiProperty({ example: '12345' })
  postalCode: string;

  @ApiProperty({ example: '서울특별시 00구 00동 00번지' })
  address: string;

  @ApiProperty({ example: '서울특별시 00구 00로 00' })
  roadAddress: string;
}
