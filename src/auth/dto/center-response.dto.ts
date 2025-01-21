import { ApiProperty } from '@nestjs/swagger';
import { CenterEntity } from '../entity/center.entity';
import { TRole } from '../entity/member.entity';

export class CenterResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '힘찬헬스장' })
  centerName: string;

  @ApiProperty({ example: '홍길동' })
  ceoName: string;

  @ApiProperty({ example: '02-0000-0000' })
  phone: string;

  @ApiProperty({ example: '서울특별시 00구 00로 00' })
  address: string;

  @ApiProperty({ example: 'example@email.com' })
  email: string;

  @ApiProperty({ example: 'CENTER' })
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
