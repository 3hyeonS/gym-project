import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TWeekendDuty } from './recruitment-register-request-dto';

export class WeekendDutyModifyRequestDto {
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
