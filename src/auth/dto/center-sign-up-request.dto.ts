import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CenterEntity } from '../entity/center.entity';

// 사업자 등록 번호 유효성 검사

export class CenterSignUpRequestDto extends CenterEntity {
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  signId: string;

  @IsNotEmpty() // null 값 체크
  @MinLength(1) // 최소 문자 수
  @MaxLength(20) // 최대 문자 수
  centerName: string;

  @IsNotEmpty() // null 값 체크
  @MinLength(2) // 최소 문자 수
  @MaxLength(20) // 최대 문자 수
  // // @IsAlphanumeric() // 영문 알파벳만 허용일 경우
  // @Matches(/^[가-힣]+$/, { message: 'ceoName 은 한글로 입력되어야 합니다.' })
  ceoName: string;

  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsNotEmpty()
  @MaxLength(100) // 주소는 최대 100자
  address: string;

  @IsNotEmpty()
  @MaxLength(20)
  businessId: string;

  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).+$/, {
    message: '비밀번호 보안 요건을 충족시키지 못했습니다.',
  }) // 소문자, 숫자, 특수문자 포함
  password: string;

  @IsNotEmpty()
  @IsEmail() // 이메일 형식
  @MaxLength(100)
  email: string;
}
