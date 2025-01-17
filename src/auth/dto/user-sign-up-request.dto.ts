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
import { TRole } from '../entity/member.entity';

export class UserSignUpRequestDto extends UserEntity {
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  signId: string;

  @IsNotEmpty() // null 값 체크
  @MinLength(1) // 최소 문자 수
  @MaxLength(20) // 최대 문자 수
  // // @IsAlphanumeric() // 영문 알파벳만 허용일 경우
  // @Matches(/^[가-힣]+$/, { message: 'userName 은 한글로 입력되어야 합니다.' })
  userName: string;

  @ValidateIf((obj) => obj.role !== undefined) // role이 존재할 경우에만 검증
  @IsEnum(['ADMIN', 'USER'], {
    message: 'Role은 ADMIN 또는 USER만 가능합니다.',
  })
  role: TRole;

  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[a-z\d@$!%*?&]{8,}$/, {
    message: '비밀번호 보안 요건을 충족시키지 못했습니다.',
  }) // 소문자, 숫자, 특수문자 포함
  password: string;

  @IsNotEmpty()
  @IsEmail() // 이메일 형식
  @MaxLength(100)
  email: string;

  // @IsNotEmpty()
  // @Matches(/^\d{5}$/, { message: 'Postal code must be 5 digits' }) // 우편번호는 5자리 숫자
  // postalCode: string;

  // @IsNotEmpty()
  // @MaxLength(100) // 주소는 최대 100자
  // address: string;

  // @MaxLength(100, { message: 'Detail address is too long' }) // 상세 주소는 선택적으로 최대 100자
  // detailAddress: string;
}
