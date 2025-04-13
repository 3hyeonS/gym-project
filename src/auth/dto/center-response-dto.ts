import { ApiProperty } from '@nestjs/swagger';
import { CenterEntity } from '../entity/center.entity';
import { TRole } from '../entity/authority.entity';

export class CenterResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'exampleId' })
  signId: string;

  @ApiProperty({ example: '힘찬헬스장' })
  centerName: string;

  @ApiProperty({ example: '홍길동' })
  ceoName: string;

  @ApiProperty({ example: '010-0000-0000' })
  phone: string;

  @ApiProperty({ example: 'example@email.com' })
  email: string;

  @ApiProperty({ example: '서울특별시 00구 00로 00' })
  address: string;

  @ApiProperty({ example: '000-00-00000' })
  businessId: string;

  @ApiProperty({ example: 'CENTER' })
  role: TRole;

  constructor(center: CenterEntity) {
    this.id = center.id;
    this.signId = center.signId;
    this.centerName = center.centerName;
    this.ceoName = center.ceoName;
    this.phone = center.phone;
    this.address = center.address;
    this.email = center.email;
    this.businessId = center.businessId;
    this.role = center.authority.role;
  }
}
