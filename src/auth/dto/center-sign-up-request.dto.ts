import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CenterEntity } from '../entity/center.entity';

// 사업자 등록 번호 유효성 검사사
@ValidatorConstraint({ name: 'IsValidBusinessID', async: false })
export class IsValidBusinessIDConstrain
  implements ValidatorConstraintInterface
{
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    return this.isValid(value);
  }

  private isValid(id: number): boolean {
    const idStr = id.toString();
    // 10자리 숫자인가?
    if (!/^[0-9]{10}$/.test(idStr)) {
      return false;
    }

    // 각 자리에 대한 가중치 값
    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];

    // 마지막 숫자는 체크디지트
    const checkDigit = parseInt(idStr[9], 10);

    // 가중치를 곱한 합계를 계산
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      const digit = parseInt(idStr[i], 10);
      if (i === 8) {
        // 8번째 자리 가중치 계산 시 추가로 10을 곱한 뒤 10으로 나눈 몫을 더함
        sum += Math.floor((digit * weights[i]) / 10);
      }
      sum += digit * weights[i];
    }

    // 10으로 나눈 나머지를 계산하고, 이를 10에서 뺀 값이 체크디지트와 일치해야 유효함
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;

    return checkDigit === calculatedCheckDigit;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return '사업자등록번호가 유효하지 않습니다.';
  }
}

export class CenterSignUpRequestDto extends CenterEntity {
  @IsNotEmpty() // null 값 체크
  @MinLength(2) // 최소 문자 수
  @MaxLength(20) // 최대 문자 수
  centerName: string;

  @IsNotEmpty() // null 값 체크
  @MinLength(2) // 최소 문자 수
  @MaxLength(20) // 최대 문자 수
  // @IsAlphanumeric() // 영문 알파벳만 허용일 경우
  @Matches(/^[가-힣]+$/, { message: 'ceoName 은 한글로 입력되어야 합니다.' })
  ceoName: string;

  @IsNotEmpty()
  @MaxLength(50)
  phone: string;

  @IsNotEmpty()
  @MaxLength(100) // 주소는 최대 100자
  address: string;

  @IsNotEmpty()
  @Validate(IsValidBusinessIDConstrain)
  businessId: number;

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
}
