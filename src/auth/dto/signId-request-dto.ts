import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignIdRequestDto {
  @ApiProperty({
    type: String,
    description: '중복 검사할 signId(6~16자리)  \n영소문자 및 숫자만 허용',
    example: 'sampleid',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(16)
  @Matches(/^[a-z\d]+$/, {
    message: 'signId must contain only alphanumeric characters(lower case)',
  })
  signId: string;
}
