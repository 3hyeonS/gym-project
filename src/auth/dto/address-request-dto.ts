import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class AddressRequestDto {
  @ApiProperty({
    type: String,
    description: '검색 주소',
    example: '송파구 올림픽로',
  })
  @IsString()
  @MaxLength(100)
  address: string;
}
