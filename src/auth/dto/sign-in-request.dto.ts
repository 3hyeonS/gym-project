import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { MemberEntity } from '../entity/member.entity';

export class SignInRequestDto extends MemberEntity {
  @IsNotEmpty()
  @MaxLength(20)
  password: string;

  @IsNotEmpty()
  @MaxLength(20)
  @IsEmail()
  signId: string;
}
