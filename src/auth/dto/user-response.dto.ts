import { ApiProperty } from '@nestjs/swagger';
import { TRole } from '../entity/member.entity';
import { UserEntity } from '../entity/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'sampleid' })
  signId: string;

  @ApiProperty({ example: '홍길동' })
  nickname: string;

  @ApiProperty({ example: 'example@email.com' })
  email: string;

  @ApiProperty({ example: 'USER' })
  role: TRole;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.signId = user.signId;
    this.nickname = user.nickname;
    this.email = user.email;
    this.role = user.role;
  }
}
