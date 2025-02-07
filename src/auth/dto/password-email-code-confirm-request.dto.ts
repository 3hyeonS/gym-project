import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordEmailCodeConfirmRequestDto {
  @ApiProperty({
    type: String,
    description: '비밀번호를 찾을 계정의 signId',
    example: 'sampleid',
  })
  @IsNotEmpty()
  @IsString()
  signId: string;

  @ApiProperty({
    type: String,
    description: 'code',
    example: 'samplecode',
  })
  @IsString()
  code: string;
}
