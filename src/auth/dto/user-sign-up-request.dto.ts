import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TRole } from '../entity/authority.entity';

export class UserSignUpRequestDto {
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
  @IsEnum(['USER', 'ADMIN'], {
    message: 'role must be ADMIN or USER only',
  })
  role: TRole = 'USER';
}
