import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailCodeConfirmRequestDto {
  @ApiProperty({
    type: String,
    description: '인증코드를 전송 받은 이메일',
    example: 'sample@email.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description: '전송 받은 인증코드',
    example: 'samplecode',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
