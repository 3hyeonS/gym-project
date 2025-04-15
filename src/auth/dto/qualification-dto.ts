import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { QualificationEntity } from '../entity/qualification.entity';

export class QualificationDto {
  @ApiProperty({
    type: String,
    description: '자격증 명',
    example: '생활스포츠지도사',
  })
  @IsNotEmpty()
  @IsString()
  certificate: string;

  @ApiProperty({
    type: String,
    description: '등급',
    example: '2급',
  })
  @IsNotEmpty()
  @IsString()
  level: string;

  constructor(qulification: QualificationEntity) {
    this.certificate = qulification.certificate;
    this.level = qulification.level;
  }
}
