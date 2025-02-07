import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EmailCodeConfirmRequestDto {
  @ApiProperty({
    type: String,
    description: 'code',
    example: 'samplecode',
  })
  @IsString()
  code: string;
}
