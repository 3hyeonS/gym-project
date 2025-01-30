import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { RegisterRequestDto } from './gym-registration-dto';

export class GymModifyRequestDto {
  @ApiProperty({
    type: Number,
    description: '등록된 헬스장 공고의 id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ValidateNested()
  @ApiProperty({
    type: RegisterRequestDto,
    description: '수정 정보 입력',
  })
  @Type(() => RegisterRequestDto)
  modifyRequest: RegisterRequestDto;
}
