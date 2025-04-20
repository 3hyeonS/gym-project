import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class NotificationModifyRequestDto {
  @ApiProperty({
    type: Boolean,
    description: '알림 허용 여부',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isAllowed: boolean;

  @ApiProperty({
    type: String,
    description: '등록할/삭제할 fcm 토큰',
    example: 'fcmTokenExample',
  })
  @IsNotEmpty()
  @IsString()
  fcmToken: string;
}
