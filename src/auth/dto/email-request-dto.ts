import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailRequestDto {
  @ApiProperty({
    type: String,
    description: 'email',
    example: 'sample@email.com',
  })
  @IsNotEmpty()
  @IsEmail() // 이메일 유효성 검사 추가
  email: string;
}
