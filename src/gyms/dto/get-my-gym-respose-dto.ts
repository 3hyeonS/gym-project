import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { GymResponseDto } from './gym-response-dto';

export class GetMyGymResponseDto {
  @ValidateNested()
  @ApiProperty({
    type: GymResponseDto,
    description: '채용 중 공고',
  })
  @Type(() => GymResponseDto)
  hiring: GymResponseDto | null;

  @ValidateNested()
  @ApiProperty({
    type: [GymResponseDto],
    description: '채용 중 공고',
  })
  @Type(() => GymResponseDto)
  expired: GymResponseDto[];

  constructor(myGym: GymResponseDto | null, myExpiredGyms: GymResponseDto[]) {
    this.hiring = myGym;
    this.expired = myExpiredGyms;
  }
}
