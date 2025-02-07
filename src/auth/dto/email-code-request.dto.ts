import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EmailCodeRequestDto {
  @ApiProperty({
    type: String,
    description: 'email',
    example: 'sample@email.com',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' }) // 이메일 유효성 검사 추가
  email: string;
}
