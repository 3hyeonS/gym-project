import { TRole, UserEntity } from '../entity/user.entity';

export class UserResponseDto {
  id: number;
  username: string;
  email: string;
  role: TRole;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.username = user.userName;
    this.email = user.email;
    this.role = user.role;
  }
}
