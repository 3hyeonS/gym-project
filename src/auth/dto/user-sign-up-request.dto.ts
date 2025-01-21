import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserEntity } from '../entity/user.entity';
import { MemberRole, TRole } from '../entity/member.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignUpRequestDto extends UserEntity {
  @ApiProperty({
    type: String,
    description: '아이디(6~16자리)  \n영소문자 및 숫자만 허용',
    example: 'sampleid',
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(16)
  @Matches(/^[a-z\d]+$/, {
    message: '아이디는 영소문자, 숫자로만 이루어져야 합니다.',
  })
  signId: string;

  @ApiProperty({
    type: String,
    description: '비밀번호(8~16자리)  \n영문, 숫자, 특수문자를 1개 이상씩 포함',
    example: 'sample@pw123',
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d)[a-zA-Z\d!@#$%^&*(),.?":{}|<>]+$/,
    {
      message: '비밀번호 보안 요건을 충족시키지 못했습니다.',
    },
  ) // 영문, 숫자, 특수문자 포함
  password: string;

  @ApiProperty({
    type: String,
    description: '이름',
    example: '홍길동',
  })
  @IsNotEmpty() // null 값 체크
  @MinLength(1) // 최소 문자 수
  @MaxLength(10) // 최대 문자 수
  // // @IsAlphanumeric() // 영문 알파벳만 허용일 경우
  // @Matches(/^[가-힣]+$/, { message: 'userName 은 한글로 입력되어야 합니다.' })
  userName: string;

  @ApiProperty({
    type: String,
    description: '이메일(이메일 형식만 허용)',
    example: 'sample@email.com',
  })
  @IsNotEmpty()
  @IsEmail() // 이메일 형식
  @MaxLength(100)
  email: string;

  @ApiProperty({
    type: String,
    enum: ['USER', 'ADMIN'],
    description: '유저 타입(관리자일 경우만 설정)',
    default: 'USER',
    example: 'ADMIN',
  })
  @ValidateIf((obj) => obj.role !== undefined) // role이 존재할 경우에만 검증
  @IsEnum(MemberRole, {
    message: 'Role은 ADMIN 또는 USER만 가능합니다.',
  })
  role: TRole;

  // @IsNotEmpty()
  // @Matches(/^\d{5}$/, { message: 'Postal code must be 5 digits' }) // 우편번호는 5자리 숫자
  // postalCode: string;

  // @IsNotEmpty()
  // @MaxLength(100) // 주소는 최대 100자
  // address: string;

  // @MaxLength(100, { message: 'Detail address is too long' }) // 상세 주소는 선택적으로 최대 100자
  // detailAddress: string;
}
