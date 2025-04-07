import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TWeekendDuty } from './recruitment-registration-request-dto';

export class WorkConditionModifyRequestDto {
  @ApiProperty({
    type: [String],
    description: '근무 시간',
    example: ['오전~오후 풀타임', '자유 근무'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  workTime: string[];

  @ApiProperty({
    enum: TWeekendDuty,
    description: '주말 당직(있음 or 없음)',
    example: TWeekendDuty.YES,
  })
  @IsNotEmpty()
  @IsEnum(TWeekendDuty, {
    message: 'weekendDuty must be 있음 or 없음 only',
  })
  weekendDuty: TWeekendDuty;
}
