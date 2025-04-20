import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FcmTokenRequestDto {
  @ApiProperty({
    type: String,
    description: '등록할 fcm 토큰',
    example: 'fcmTokenExample',
  })
  @IsNotEmpty()
  fcmToken: string;
}
