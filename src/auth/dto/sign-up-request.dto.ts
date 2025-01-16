import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TRole, UserEntity, UserRole } from '../entity/user.entity';

export class SignUpRequestDto extends UserEntity {
  @IsNotEmpty() // null 값 체크
  @MinLength(2) // 최소 문자 수
  @MaxLength(20) // 최대 문자 수
  // @IsAlphanumeric() // 영문 알파벳만 허용일 경우
  @Matches(/^[가-힣]+$/, { message: 'Username 은 한글로 입력되어야 합니다.' })
  userName: string;

  @IsNotEmpty()
  @MaxLength(20)
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    { message: '비밀번호 보안 요건을 충족시키지 못했습니다.' },
  ) // 대문자, 소문자, 숫자, 특수문자 포함
  password: string;

  @IsNotEmpty()
  @IsEmail() // 이메일 형식
  @MaxLength(100)
  email: string;

  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Role은 ADMIN 또는 USER만 가능합니다.' })
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
