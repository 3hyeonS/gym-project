import { TRole } from '../entity/member.entity';
import { UserEntity } from '../entity/user.entity';

export class UserResponseDto {
  id: number;
  userName: string;
  email: string;
  role: TRole;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.userName = user.userName;
    this.email = user.email;
    this.role = user.role;
  }
}
