import { IsNotEmpty, IsString, Length } from 'class-validator';
import { MemberEntity } from '../entity/member.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SignInRequestDto extends MemberEntity {
  @ApiProperty({
    type: String,
    description: '아이디',
    example: 'sampleid',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  signId: string;

  @ApiProperty({
    type: String,
    description: '비밀번호',
    example: 'sample@pw123',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  password: string;
}
