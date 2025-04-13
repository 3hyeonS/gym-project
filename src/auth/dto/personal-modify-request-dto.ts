import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class PersonalModifyRequestDto {
  @ApiProperty({
    type: String,
    description: '증명사진 url(100자 이내)',
    example: 'url',
  })
  @IsOptional()
  @Length(1, 100)
  @IsString()
  portfolioImage?: string = null;

  @ApiProperty({
    type: String,
    description: '이름',
    example: '홍길동',
  })
  @IsNotEmpty() // null 값 체크
  @IsString()
  @Length(1, 20) // 문자 수
  name: string;

  @ApiProperty({
    type: Date,
    description: '생년월일',
    example: '1999-03-17',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  birth: Date;

  @ApiProperty({
    type: String,
    description: '전화번호(000-0000-0000 형식만 허용)',
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
    description: '이메일(이메일 형식만 허용)',
    example: 'sample@email.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail() // 이메일 형식
  @Length(1, 100)
  email: string;

  @ApiProperty({
    type: Number,
    description: '성별  \n0: 남성  \n1: 여성',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1], { message: 'apply must be 0 or 1' })
  gender: number;
}
