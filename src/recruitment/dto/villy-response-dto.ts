import { ApiProperty } from '@nestjs/swagger';
import { RecruitmentEntity } from '../entity/recruitment.entity';
import { Datetime } from 'aws-sdk/clients/costoptimizationhub';
import { VillyEntity } from '../entity/villy.entity';

export class VillyResponseDto {
  @ApiProperty({
    type: Number,
    description: 'id',
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: Number,
    description: '유형  \n매칭: 0  \n지원: 1  \n면접제안: 1',
    example: 1,
  })
  messageType: number;

  @ApiProperty({
    type: Date,
    description: '생성시간',
    example: '2025-01-09',
  })
  createdAt: Date;

  constructor(villy: VillyEntity) {
    this.id = villy.id;
    this.messageType = villy.messageType;
  }
}
