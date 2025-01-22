import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CenterEntity } from '../entity/center.entity';
import { ApiProperty } from '@nestjs/swagger';

// 사업자 등록 번호 유효성 검사

export class CenterSignUpRequestDto extends CenterEntity {
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
  ) // 소문자, 숫자, 특수문자 포함
  password: string;

  @ApiProperty({
    type: String,
    description: '센터명',
    example: '힘찬헬스장',
  })
  @IsNotEmpty() // null 값 체크
  @MinLength(1) // 최소 문자 수
  @MaxLength(100) // 최대 문자 수
  centerName: string;

  @ApiProperty({
    type: String,
    description: '대표자 이름',
    example: '홍길동',
  })
  @IsNotEmpty() // null 값 체크
  @MinLength(1) // 최소 문자 수
  @MaxLength(10) // 최대 문자 수
  // // @IsAlphanumeric() // 영문 알파벳만 허용일 경우
  // @Matches(/^[가-힣]+$/, { message: 'ceoName 은 한글로 입력되어야 합니다.' })
  ceoName: string;

  @ApiProperty({
    type: String,
    description: '주소',
    example: '서울특별시 00구 00로 00',
  })
  @IsNotEmpty()
  @MaxLength(100) // 주소는 최대 100자
  address: string;

  @ApiProperty({
    type: String,
    description: '대표 전화번호',
    example: '010-0000-0000',
  })
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\d{3}-\d{4}-\d{4}$/, {
    message: '전화번호 형식에 어긋납니다.',
  })
  phone: string;

  @ApiProperty({
    type: String,
    description: '사업자 등록 번호(10자리)',
    example: '000-00-00000',
  })
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\d{3}-\d{2}-\d{5}$/, {
    message: '사업자 등록 번호 형식에 어긋납니다.',
  })
  businessId: string;

  @ApiProperty({
    type: String,
    description: '이메일(이메일 형식만 허용)',
    example: 'sample@email.com',
  })
  @IsNotEmpty()
  @IsEmail() // 이메일 형식
  @MaxLength(100)
  email: string;
}
