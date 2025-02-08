import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class PasswordEmailCodeConfirmRequestDto {
  @ApiProperty({
    type: String,
    description: '계정의 signId',
    example: 'sampleid',
  })
  @IsNotEmpty()
  @IsString()
  signId: string;

  @ApiProperty({
    type: String,
    description:
      '새로운 비밀번호(8~16자리)  \n영문, 숫자, 특수문자를 1개 이상씩 포함',
    example: 'sample@pw123',
  })
  @IsNotEmpty()
  @IsString()
  @Length(8, 16)
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d)[a-zA-Z\d!@#$%^&*(),.?":{}|<>]+$/,
    {
      message: 'password must contain English, numbers, and special characters',
    },
  ) // 영문, 숫자, 특수문자 포함
  newPassword: string;
}
