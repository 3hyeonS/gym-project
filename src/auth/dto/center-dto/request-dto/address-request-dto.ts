import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddressRequestDto {
  @ApiProperty({
    type: String,
    description: '검색 주소',
    example: '송파구 올림픽로',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  address: string;
}
