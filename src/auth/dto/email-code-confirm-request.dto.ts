import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EmailCodeConfirmRequestDto {
  @ApiProperty({
    type: String,
    description: 'code',
    example: 'samplecode',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
