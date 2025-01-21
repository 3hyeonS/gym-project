import { ApiProperty } from '@nestjs/swagger';
import { TRole } from '../entity/member.entity';
import { UserEntity } from '../entity/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '홍길동' })
  userName: string;

  @ApiProperty({ example: 'example@email.com' })
  email: string;

  @ApiProperty({ example: 'USER' })
  role: TRole;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.userName = user.userName;
    this.email = user.email;
    this.role = user.role;
  }
}
