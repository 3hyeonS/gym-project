import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { MemberEntity, TRole } from '../entity/member.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SignInRequestDto extends MemberEntity {
  @ApiProperty({
    type: String,
    description: '아이디',
    example: 'sampleid',
  })
  @IsNotEmpty()
  @MaxLength(20)
  signId: string;

  @ApiProperty({
    type: String,
    description: '비밀번호',
    example: 'sample@pw123',
  })
  @IsNotEmpty()
  @MaxLength(20)
  password: string;

  // @IsNotEmpty()
  // @IsEnum(['USER', 'CENTER', 'ADMIN'], {
  //   message: 'Role은 USER, CENTER, 또는 ADMIN만 가능합니다.',
  // })
  // role: TRole;
}
