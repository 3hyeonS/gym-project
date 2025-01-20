import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { MemberEntity, TRole } from '../entity/member.entity';

export class SignInRequestDto extends MemberEntity {
  @IsNotEmpty()
  @MaxLength(20)
  password: string;

  @IsNotEmpty()
  @MaxLength(20)
  signId: string;

  // @IsNotEmpty()
  // @IsEnum(['USER', 'CENTER', 'ADMIN'], {
  //   message: 'Role은 USER, CENTER, 또는 ADMIN만 가능합니다.',
  // })
  // role: TRole;
}
