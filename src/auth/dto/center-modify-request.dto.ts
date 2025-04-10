import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CenterModifyRequestDto {
  @ApiProperty({
    type: String,
    description: '비밀번호(8~16자리)  \n영문, 숫자, 특수문자를 1개 이상씩 포함',
    example: 'sample@pw123',
  })
  @IsOptional()
  @IsString()
  @Length(8, 16)
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d)[a-zA-Z\d!@#$%^&*(),.?":{}|<>]+$/,
    {
      message: 'password must contain English, numbers, and special characters',
    },
  ) // 영문, 숫자, 특수문자 포함
  password?: string;

  @ApiProperty({
    type: String,
    description: '대표 전화번호',
    example: '010-0000-0000',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{3}-\d{4}-\d{4}$/, {
    message: 'phone format must be 000-0000-0000',
  })
  phone: string;

  @ApiProperty({
    type: String,
    description: '이메일(이메일 형식만 허용)',
    example: 'sample@email.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @Length(1, 100)
  email: string;
}
