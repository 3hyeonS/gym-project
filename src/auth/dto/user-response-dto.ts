import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../entity/user.entity';
import { TRole } from '../entity/authority.entity';
import { TPlatform } from '../entity/signWith.entity';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '홍길동' })
  nickname: string;

  @ApiProperty({ example: 'example@email.com' })
  email: string;

  @ApiProperty({ example: 'KAKAO' })
  platform: TPlatform;

  @ApiProperty({ example: 'USER' })
  role: TRole;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.nickname = user.nickname;
    this.email = user.email;
    this.platform = user.signWith.platform;
    this.role = user.authority.role;
  }
}
