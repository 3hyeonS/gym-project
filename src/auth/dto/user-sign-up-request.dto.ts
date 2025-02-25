import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { MemberRole, TRole } from '../entity/member.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignUpRequestDto {
  @ApiProperty({
    type: String,
    description: 'signId(6~16자리)  \n영소문자 및 숫자만 허용',
    example: 'sampleid',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 16)
  @Matches(/^[a-z\d]+$/, {
    message: 'signId must contain only alphanumeric characters(lower case)',
  })
  signId: string;

  @ApiProperty({
    type: String,
    description: '비밀번호(8~16자리)  \n영문, 숫자, 특수문자를 1개 이상씩 포함',
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
  password: string;

  @ApiProperty({
    type: String,
    description: '닉네임',
    example: '홍길동',
  })
  @IsNotEmpty() // null 값 체크
  @IsString()
  @Length(1, 20) // 문자 수
  nickname: string;

  @ApiProperty({
    type: String,
    description: '이메일(이메일 형식만 허용)',
    example: 'sample@email.com',
  })
  @IsNotEmpty()
  @IsEmail() // 이메일 형식
  @Length(1, 100)
  email: string;

  @ApiProperty({
    type: String,
    enum: ['USER', 'ADMIN'],
    description: '유저 타입(관리자일 경우만 설정)',
    default: 'USER',
    example: 'ADMIN',
  })
  @IsEnum(MemberRole, {
    message: 'role must be ADMIN or USER only',
  })
  role: TRole = 'USER';

  // @IsNotEmpty()
  // @Matches(/^\d{5}$/, { message: 'Postal code must be 5 digits' }) // 우편번호는 5자리 숫자
  // postalCode: string;

  // @IsNotEmpty()
  // @MaxLength(100) // 주소는 최대 100자
  // address: string;

  // @MaxLength(100, { message: 'Detail address is too long' }) // 상세 주소는 선택적으로 최대 100자
  // detailAddress: string;
}
