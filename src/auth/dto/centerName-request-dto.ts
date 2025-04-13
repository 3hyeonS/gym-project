import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class centerNameRequestDto {
  @ApiProperty({
    type: String,
    description: '센터명',
    example: '힘찬헬스장',
  })
  @IsNotEmpty()
  @IsString()
  centerName: string;
}
