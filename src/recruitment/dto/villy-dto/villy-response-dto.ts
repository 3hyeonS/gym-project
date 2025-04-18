import { ApiProperty } from '@nestjs/swagger';
import { VillyEntity } from 'src/recruitment/entity/villy.entity';
import { RecruitmentResponseDto } from '../recruitment-dto/response-dto/recruitment-response-dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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

  @ValidateNested()
  @ApiProperty({
    type: RecruitmentResponseDto,
    description: '채용 공고',
  })
  @Type(() => RecruitmentResponseDto)
  recruitment: RecruitmentResponseDto;

  constructor(villy: VillyEntity) {
    this.id = villy.id;
    this.messageType = villy.messageType;
    this.createdAt = villy.createdAt;
    this.recruitment = new RecruitmentResponseDto(villy.recruitment);
  }
}
