import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { CenterEntity } from '../entity/center.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CenterModifyRequestDto extends CenterEntity {
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
    description: '센터명',
    example: '힘찬헬스장',
  })
  @IsNotEmpty() // null 값 체크
  @IsString()
  @Length(1, 100) // 문자 수
  centerName: string;

  @ApiProperty({
    type: String,
    description: '대표자 이름',
    example: '홍길동',
  })
  @IsNotEmpty() // null 값 체크
  @IsString()
  @Length(1, 20) // 문자 수
  // // @IsAlphanumeric() // 영문 알파벳만 허용일 경우
  // @Matches(/^[가-힣]+$/, { message: 'ceoName 은 한글로 입력되어야 합니다.' })
  ceoName: string;

  @ApiProperty({
    type: String,
    description: '주소',
    example: '서울특별시 00구 00로 00',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100) // 주소는 최대 100자
  address: string;

  @ApiProperty({
    type: String,
    description: '대표 전화번호',
    example: '010-0000-0000',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{3}-\d{4}-\d{4}$/, {
    message: 'phone format must be 000-0000-0000',
  })
  phone: string;

  @ApiProperty({
    type: String,
    description: '사업자 등록 번호(10자리)',
    example: '000-00-00000',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{3}-\d{2}-\d{5}$/, {
    message: 'businessId format must be 000-00-00000',
  })
  businessId: string;

  @ApiProperty({
    type: String,
    description: '이메일(이메일 형식만 허용)',
    example: 'sample@email.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail() // 이메일 형식
  @Length(1, 100)
  email: string;
}
