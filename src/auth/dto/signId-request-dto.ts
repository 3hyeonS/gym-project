import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

export class SignIdRequestDto {
  @ApiProperty({
    type: String,
    description: '중복 검사할 signId(6~16자리)  \n영소문자 및 숫자만 허용',
    example: 'sampleid',
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(16)
  @Matches(/^[a-z\d]+$/, {
    message: '아이디는 영소문자, 숫자로만 이루어져야 합니다.',
  })
  signId: string;
}
