import { CenterEntity } from '../entity/center.entity';
import { TRole } from '../entity/member.entity';

export class CenterResponseDto {
  id: number;
  centerName: string;
  ceoName: string;
  phone: string;
  address: string;
  email: string;
  role: TRole;

  constructor(center: CenterEntity) {
    this.id = center.id;
    this.centerName = center.centerName;
    this.ceoName;
    this.phone;
    this.address;
    this.email = center.email;
    this.role = center.role;
  }
}
